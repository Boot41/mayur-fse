import logging
import os
import json
import re
import asyncio
from datetime import datetime
import ast

from dotenv import load_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
    metrics,
    stt,
    transcription,
)
from livekit import rtc
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import cartesia, openai, deepgram, silero, turn_detector

# Set up transcript storage
class TranscriptStore:
    def __init__(self, file_path=None):
        self.file_path = file_path
        self.conversations = {"conversations": []}
        self.initialized = False
        
    def set_file_path(self, file_path):
        self.file_path = file_path
        # Initialize file
        with open(self.file_path, "w") as f:
            json.dump(self.conversations, f, indent=2)
        print(f"Initialized transcript file: {file_path}")
        self.initialized = True
    
    def add_transcript(self, speaker, text):
        if not self.initialized or not text.strip():
            return
            
        # Check if this message is already saved (to avoid duplicates)
        existing = [
            entry for entry in self.conversations["conversations"] 
            if entry["speaker"] == speaker and entry["text"] == text
        ]
        
        if not existing:
            entry = {
                "timestamp": datetime.now().isoformat(),
                "speaker": speaker,
                "text": text
            }
            
            self.conversations["conversations"].append(entry)
            
            # Save to file
            try:
                with open(self.file_path, "w") as f:
                    json.dump(self.conversations, f, indent=2)
                print(f"Saved transcript: {speaker}: {text}")
            except Exception as e:
                print(f"Error saving transcript: {e}")

# Create a transcript store
transcript_store = TranscriptStore()

# Set up logging
load_dotenv(dotenv_path=".env.local")
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger("voice-agent")

# Add OpenAI log handler
class OpenAITranscriptHandler(logging.Handler):
    def emit(self, record):
        try:
            log_msg = self.format(record)
            
            # Look for OpenAI request logs with message content
            if "Request options" in log_msg and "'messages':" in log_msg:
                # Extract the JSON-like structure
                match = re.search(r"'json_data': (\{.*\})", log_msg)
                if match:
                    # Parse the JSON-like string
                    json_str = match.group(1)
                    try:
                        data = ast.literal_eval(json_str)
                        if 'messages' in data:
                            messages = data['messages']
                            # Process all non-system messages
                            for msg in messages:
                                if msg['role'] == 'system':
                                    continue
                                speaker = "Bot" if msg['role'] == 'assistant' else "User"
                                text = msg['content']
                                transcript_store.add_transcript(speaker, text)
                    except (SyntaxError, ValueError) as e:
                        print(f"Error parsing JSON-like data: {e}")
        except Exception as e:
            print(f"Error in OpenAI log handler: {e}")

openai_handler = OpenAITranscriptHandler()
openai_logger = logging.getLogger("openai._base_client")
openai_logger.addHandler(openai_handler)

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

# STT forwarding function
async def forward_transcription(
    stt_stream: stt.SpeechStream,
    stt_forwarder: transcription.STTSegmentsForwarder,
):
    """Forward the transcription and log the transcript in the console and to our store"""
    async for ev in stt_stream:
        stt_forwarder.update(ev)
        
        if ev.type == stt.SpeechEventType.INTERIM_TRANSCRIPT:
            # Interim transcripts can be logged but we don't save them
            print(f"Interim: {ev.alternatives[0].text}", end="")
        elif ev.type == stt.SpeechEventType.FINAL_TRANSCRIPT:
            # Final transcripts should be saved
            final_text = ev.alternatives[0].text
            print(f"\nFinal: {final_text}")
            transcript_store.add_transcript("User", final_text)

async def entrypoint(ctx: JobContext):
    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(
            "You are a bot that tracks an employee's daily progress. "
            "Provide short, concise responses and avoid unpronounceable punctuation. "
            "The user provides only voice input, so don't expect text. "
            "End the conversation with 'Thank you for your time'."
        ),
    )
    
    logger.info(f"Connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    participant = await ctx.wait_for_participant()
    logger.info(f"Starting voice assistant for participant {participant.identity}")
    
    os.makedirs("transcriptions", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_file_path = os.path.abspath(os.path.join("transcriptions", f"transcript_{participant.identity}_{timestamp}.json"))
    
    logger.info(f"Transcriptions will be saved to: {json_file_path}")
    
    # Set the file path for the transcript store
    transcript_store.set_file_path(json_file_path)
    
    # Create DeepGram STT service
    deepgram_stt = deepgram.STT()
    transcription_tasks = []
    
    # Set up track subscription for direct STT forwarding
    @ctx.room.on("track_subscribed")
    def on_track_subscribed(
        track: rtc.Track,
        publication: rtc.TrackPublication,
        participant: rtc.RemoteParticipant,
    ):
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            logger.info(f"Subscribed to audio track from {participant.identity}")
            
            async def transcribe_track(participant, track):
                try:
                    audio_stream = rtc.AudioStream(track)
                    stt_forwarder = transcription.STTSegmentsForwarder(
                        room=ctx.room, participant=participant, track=track
                    )
                    stt_stream = deepgram_stt.stream()
                    
                    # Start forwarding transcriptions
                    forward_task = asyncio.create_task(
                        forward_transcription(stt_stream, stt_forwarder)
                    )
                    transcription_tasks.append(forward_task)
                    
                    # Process audio frames
                    async for ev in audio_stream:
                        stt_stream.push_frame(ev.frame)
                except Exception as e:
                    logger.exception(f"Error in transcribe_track: {e}")
            
            transcription_tasks.append(asyncio.create_task(transcribe_track(participant, track)))
    
    # Set up the voice pipeline agent
    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(),  # Using DeepGram for the agent STT as well
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=cartesia.TTS(),
        turn_detector=turn_detector.EOUModel(),
        min_endpointing_delay=0.5,
        max_endpointing_delay=5.0,
        chat_ctx=initial_ctx,
    )
    
    # Save bot responses directly
    @agent.on("speech_committed")
    def on_speech_committed(event):
        if hasattr(event, 'agent_transcript') and event.agent_transcript:
            transcript_store.add_transcript("Bot", event.agent_transcript)
    
    usage_collector = metrics.UsageCollector()
    
    @agent.on("metrics_collected")
    def on_metrics_collected(agent_metrics: metrics.AgentMetrics):
        metrics.log_metrics(agent_metrics)
        usage_collector.collect(agent_metrics)
    
    agent.start(ctx.room, participant)
    
    # Send an initial greeting
    initial_greeting = "Hey, ready to tell me your completed tasks and your new tasks?"
    await agent.say(initial_greeting, allow_interruptions=True)
    transcript_store.add_transcript("Bot", initial_greeting)
    
    # Keep the room connection alive until it's closed
    try:
        while ctx.room.connection_state != "disconnected":
            await asyncio.sleep(1)
    except Exception as e:
        logger.error(f"Error in room connection: {e}")
    finally:
        # Clean up tasks
        for task in transcription_tasks:
            if not task.done():
                task.cancel()

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        ),
    )