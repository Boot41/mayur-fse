import json
import re
import logging

def extract_json_from_response(response_text):
    """Extract JSON from response text that might contain markdown formatting"""
    # Try to find JSON content between markdown code blocks
    json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
    
    if json_match:
        json_str = json_match.group(1)
    else:
        # If no markdown blocks found, try to find JSON directly
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
        else:
            raise ValueError("No JSON content found in response")
    
    # Clean up any remaining markdown or formatting
    json_str = json_str.strip()
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {e}")
        logger.debug(f"JSON string attempted to parse: {json_str}")
        raise