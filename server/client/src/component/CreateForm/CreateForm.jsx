import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import './CreateForm.css'

const CreateForm = () => {
    const [url, setUrl] = useState('');
    const [name, setName] = useState('');
    const ID = function () {
        return '_' + Math.random().toString(36).substr(2, 9);
    };
    return (
        <section id="creater">
            <form className="creater-form" autoComplete="off">
                <div className="creter-background"></div>
                <div className="input-field">
                    <input required value={url} onChange={(event) => { setUrl(event.target.value) }} name="url" type="text" />
                    <label>Please Enter Your Video URL</label>
                    <span></span>
                </div>
                <div className="input-field">
                    <input required value={name} onChange={(event) => { setName(event.target.value) }} name="name" type="text" />
                    <label>Please Enter Your Name</label>
                    <span></span>
                </div>
                <Link to={{ pathname: `/session/${ID()}/${name}`, state: url }}>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    Create Session</Link>
            </form>
        </section>
    )
}

export default CreateForm