import { useState } from "react";
import { lazy } from "react";

const Modal = lazy(() => import("../components/Modal"));

const Create = () => {
    const [ isOpen, setIsOpen ] = useState(false);
    return (
        <div>
            <button onClick={() => setIsOpen(true)}>Add</button>
            { isOpen && <Modal setIsOpen={ setIsOpen } /> }
        </div>
    )
}

export default Create;