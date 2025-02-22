import React, { useState } from 'react';
import { Card, Form, Button, ListGroup } from 'react-bootstrap';

const Tasks = () => {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Review project requirements', completed: false },
        { id: 2, text: 'Create wireframes', completed: true },
        { id: 3, text: 'Implement authentication', completed: false },
        { id: 4, text: 'Write unit tests', completed: false },
        { id: 5, text: 'Deploy to staging', completed: false }
    ]);

    const [newTask, setNewTask] = useState('');

    const handleAddTask = (e) => {
        e.preventDefault();
        if (newTask.trim()) {
            setTasks([
                ...tasks,
                { id: tasks.length + 1, text: newTask, completed: false }
            ]);
            setNewTask('');
        }
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    return (
        <div>
            <h2 className="mb-4">Tasks</h2>
            <Card className="mb-4">
                <Card.Body>
                    <Form onSubmit={handleAddTask}>
                        <div className="d-flex gap-2">
                            <Form.Control
                                type="text"
                                placeholder="Add a new task..."
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                            />
                            <Button type="submit" variant="primary">Add</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    <ListGroup variant="flush">
                        {tasks.map(task => (
                            <ListGroup.Item
                                key={task.id}
                                className="d-flex justify-content-between align-items-center"
                            >
                                <div className="d-flex align-items-center">
                                    <Form.Check
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => toggleTask(task.id)}
                                        className="me-3"
                                    />
                                    <span style={{
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                        color: task.completed ? '#6c757d' : 'inherit'
                                    }}>
                                        {task.text}
                                    </span>
                                </div>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => deleteTask(task.id)}
                                >
                                    <i className="bi bi-trash"></i>
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card.Body>
                <Card.Footer>
                    <small className="text-muted">
                        {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
                    </small>
                </Card.Footer>
            </Card>
        </div>
    );
};

export default Tasks;
