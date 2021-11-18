import './App.css';

function TextBox(props) {

    const myTextChangeHandler = (event) => {props.change(event.target.value)}

    return (
        <div className={"TextBox"}>
            <label> {props.label}
                <input
                    type='text'
                    onChange={myTextChangeHandler}>
                </input>
            </label>
        </div>
    );
}
export default TextBox;