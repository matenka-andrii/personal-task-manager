// Core
import React, { Component } from 'react';
import Move from 'react-flip-move';
import { string } from 'prop-types';

// Instruments
import Styles from './styles.scss';
import Checkbox from '../../theme/assets/Checkbox.js';
import Task from '../Task';


export default class Scheduler extends Component {
    static contextTypes = {
        api:   string.isRequired,
        token: string.isRequired,
    };

    state = {
        tasks:         [],
        message:       '',
        searchMessage: '',
    }

    componentDidMount () {
        this._fetchTasks();
    }

    _createTask = async (todo) => {
        const { api, token } = this.context;

        try {
            const response = await fetch(api, {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({ message: todo }),
            });

            if (response.status !== 200) {
                throw new Error('Create task error');
            }

            const { data } = await response.json();

            this.setState(({ tasks }) => ({
                tasks: this._sortTasks([data, ...tasks]),
            }));
        } catch ({ message }) {
            console.error(message);
        }
    }
    _deleteTask = async (id) => {
        const { api, token } = this.context;

        try {
            const response = await fetch(`${api}/${id}`, {
                method:  'DELETE',
                headers: {
                    'Authorization': token,
                },
            });

            if (response.status !== 204) {
                throw new Error('Delete task error');
            }

            this.setState(({ tasks }) => ({
                tasks: tasks.filter((task) => task.id !== id),
            }));
        } catch ({ message }) {
            console.error(message);
        }
    }
    _fetchTasks = async () => {
        const { api, token } = this.context;

        try {
            const response = await fetch(api, {
                method:  'GET',
                headers: {
                    'Authorization': token,
                },
            });

            if (response.status !== 200) {
                throw new Error('Fetch tasks error');
            }

            const { data } = await response.json();

            this.setState({ tasks: this._sortTasks(data) });
        } catch ({ message }) {
            console.error(message);
        }
    }
    _handleAllCompleted = () => {
        const { tasks } = this.state;

        tasks
            .filter((task) => !task.completed)
            .map((task) => {
                task.completed = true;

                return task;
            });

        this._updateTasks(tasks);
    }
    _handleSearchInputChange = ({ target: { value }}) => {
        this.setState({ searchMessage: value.toLowerCase() });
    }
    _handleSubmit = (e) => {
        e.preventDefault();
        const message = this.state.message.trim();

        if (message) {
            this._createTask(message);
            this.setState({
                message: '',
            });
        }
    }
    _handleTextInputChange = (e) => {
        const value = e.target.value.replace(/ +(?= )/g, '');

        if (value.length <= 46) {
            this.setState({
                message: value,
            });
        }
    }
    _sortTasks = (tasks) => {
        const favorite = tasks.filter((task) => task.favorite && !task.completed);
        const data = tasks.filter((task) => !task.favorite && !task.completed);
        const completed = tasks.filter((task) => task.completed);

        completed.sort((a, b) => {
            if (a.favorite && !b.favorite) {
                return -1;
            } else if (!a.favorite && b.favorite) {
                return 1;
            }

            return false;
        });

        return [...favorite, ...data, ...completed];
    }
    _updateTasks = async (newTasks) => {
        const { api, token } = this.context;

        try {
            const response = await fetch(api, {
                method:  'PUT',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify(newTasks),
            });

            if (response.status !== 200) {
                throw new Error('Update tasks error');
            }

            const { data } = await response.json();
            let { tasks } = this.state;

            data.forEach((item) => {
                tasks = tasks.filter((task) => task.id !== item.id);
            });
            this.setState(() => ({
                tasks: this._sortTasks([...data, ...tasks]),
            }));
        } catch ({ message }) {
            console.error(message);
        }
    }

    render () {
        const { tasks:tasksData, message, searchMessage } = this.state;
        const allCompleted = tasksData.every((task) => task.completed) && tasksData.length > 0;
        const tasks = tasksData
            .filter((task) => task.message.toLowerCase().includes(searchMessage))
            .map((task) => (
                <Task
                    deleteTask = { this._deleteTask }
                    key = { task.id }
                    updateTasks = { this._updateTasks }
                    { ...task }
                />
            ));

        return (
            <section className = { Styles.scheduler }>
                <main>
                    <header>
                        <h1>Планировщик задач</h1>
                        <input
                            type = 'text'
                            value = { searchMessage }
                            onChange = { this._handleSearchInputChange }
                        />
                    </header>
                    <section>
                        <form
                            onSubmit = { this._handleSubmit }>
                            <input
                                placeholder = 'Описание моей новой задачи'
                                type = 'text'
                                value = { message }
                                onChange = { this._handleTextInputChange }
                            />
                            <button>Добавить задачу</button>
                        </form>
                        <ul>
                            <Move
                                duration = { 400 }
                                easing = 'ease-in-out'>
                                { tasks }
                            </Move>
                        </ul>
                    </section>
                    <footer>
                        <Checkbox
                            checked = { allCompleted }
                            color1 = '#000'
                            color2 = '#f5f5f5'
                            onClick = { this._handleAllCompleted }
                        />
                        <p>Все задачи выполнены</p>
                    </footer>
                </main>
            </section>
        );
    }
}
