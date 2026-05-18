import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { useModalStore } from './modalStore';
import styles from './ModalHandler.module.css';
import { classNames } from '../../utils/utils';

export { displayModal, closeModal, closeAllModals } from './modalStore';

const ModalContext = createContext({ close: () => {}, id: null });

export function useModal() {
    return useContext(ModalContext);
}

export function ModalHandler() {
    const modals = useModalStore(state => state.modals);

    return (
        <>
            {modals.map((modal, i) => (
                <ModalShell
                    key={modal.id}
                    modal={modal}
                    stacked={i > 0}
                />
            ))}
        </>
    );
}

function ModalShell({ modal, stacked }) {
    const dialogRef = useRef(null);
    const close = useModalStore(state => state.close);
    const handleClose = useCallback(() => close(modal.id), [close, modal.id]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        dialog.showModal();
    }, []);

    const handleBackdropClick = (e) => {
        if (e.target === dialogRef.current) handleClose();
    };

    return (
        <dialog
            ref={dialogRef}
            className={classNames(styles.modal, stacked && styles.stacked)}
            onClose={handleClose}
            onClick={handleBackdropClick}
        >
            <ModalContext.Provider value={{ close: handleClose, id: modal.id }}>
                {modal.content}
            </ModalContext.Provider>
        </dialog>
    );
}
