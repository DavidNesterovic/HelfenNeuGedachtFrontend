import { ref } from 'vue';

const isOpen = ref(false);
const title = ref('');
const message = ref('');
const isConfirm = ref(false);
const resolvePromise = ref(null);

export const useDialog = () => {
    const show = (options) => {
        title.value = options.title || 'Hinweis';
        message.value = options.message || '';
        isConfirm.value = !!options.isConfirm;
        isOpen.value = true;
        
        return new Promise((resolve) => {
            resolvePromise.value = resolve;
        });
    };

    const alert = (titleText, messageText = '') => {
        // Handle single argument call (e.g. alert("message"))
        if (!messageText) {
            messageText = titleText;
            titleText = 'Hinweis';
        }
        return show({ title: titleText, message: messageText, isConfirm: false });
    };

    const confirm = (titleText, messageText = '') => {
        if (!messageText) {
            messageText = titleText;
            titleText = 'Bestätigung';
        }
        return show({ title: titleText, message: messageText, isConfirm: true });
    };

    const close = (value) => {
        isOpen.value = false;
        if (resolvePromise.value) {
            resolvePromise.value(value);
            resolvePromise.value = null;
        }
    };

    return {
        isOpen,
        title,
        message,
        isConfirm,
        alert,
        confirm,
        close
    };
};
