// Core
import React, { Component } from 'react';
import { string, bool, func } from 'prop-types';

// Instruments
import Styles from './styles.scss';
import Checkbox from '../../theme/assets/Checkbox.js';
import StarIcon from '../../theme/assets/Star.js';
import EditIcon from '../../theme/assets/Edit.js';
import DeleteIcon from '../../theme/assets/Delete.js';

export default class Task extends Component {
    static propTypes = {
        completed:   bool.isRequired,
        created:     string.isRequired,
        deleteTask:  func.isRequired,
        favorite:    bool.isRequired,
        message:     string.isRequired,
        updateTasks: func.isRequired,
        modified:    string,
    };

    state = {
        message:   this.props.message,
        isEditing: false,
    }

    _completeTask = () => {
        const { updateTasks, id, message, completed, favorite } = this.props;

        updateTasks([{
            id,
            message,
            completed: !completed,
            favorite,
        }]);
    }
    _deleteTask = () => {
        const { deleteTask, id } = this.props;

        deleteTask(id);
    }
    _favoriteTask = () => {
        const { updateTasks, id, message, completed, favorite } = this.props;

        if (!completed) {
            updateTasks([{
                id,
                message,
                completed,
                favorite: !favorite,
            }]);
        }
    }
    _handleEditing = () => {
        const { isEditing, message: newMessage } = this.state;
        const { updateTasks, id, message, completed, favorite } = this.props;

        if (!completed) {
            if (!isEditing) {
                this.setState({ isEditing: true });
            } else {
                if (newMessage.trim() !== message) {
                    updateTasks([{
                        id,
                        message: newMessage.trim(),
                        completed,
                        favorite,
                    }]);
                }
                this.setState({
                    message:   newMessage.trim(),
                    isEditing: false,
                });
            }
        }
    }
    _handleKeyDown = ({ key }) => {
        const { message: newMessage } = this.state;
        const { updateTasks, id, message, completed, favorite } = this.props;

        if (key === 'Escape') {
            this.setState({
                isEditing: false,
                message,
            });
        } else if (key === 'Enter') {
            if (newMessage.trim() !== message) {
                updateTasks([{
                    id,
                    message: newMessage.trim(),
                    completed,
                    favorite,
                }]);
            }
            this.setState({
                message:   newMessage.trim(),
                isEditing: false,
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

    render () {
        const { isEditing, message } = this.state;
        const { completed, favorite } = this.props;
        const taskStyles = completed
            ? `${Styles.task} ${Styles.completed}`
            : isEditing
                ? `${Styles.task} ${Styles.editing}`
                : Styles.task;
        const messageOutput = isEditing
            ? <input
                autoFocus
                type = 'text'
                value = { message }
                onChange = { this._handleTextInputChange }
                onKeyDown = { this._handleKeyDown }
            />
            : <p> { message } </p>;

        return (
            <li
                className = { taskStyles } >
                <div>
                    <Checkbox
                        checked = { completed }
                        color1 = '#3b8ef3'
                        color2 = '#fff'
                        onClick = { this._completeTask }
                    />
                    { messageOutput }
                </div>
                <div>
                    <StarIcon
                        checked = { favorite }
                        color1 = '#3b8ef3'
                        color2 = '#000'
                        color3 = '#9d9d9d'
                        disabled = { completed }
                        onClick = { this._favoriteTask }
                    />
                    <EditIcon
                        color1 = '#3b8ef3'
                        color2 = '#000'
                        color3 = '#9d9d9d'
                        disabled = { completed }
                        onClick = { this._handleEditing }
                    />
                    <DeleteIcon
                        color1 = '#3b8ef3'
                        color2 = '#000'
                        onClick = { this._deleteTask }
                    />
                </div>
            </li>
        );
    }
}
