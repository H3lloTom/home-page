import React from 'react';

let toasts = [];
const setToasts = toast => {
  const nextToasts = toasts.concat([toast]);
  toasts = nextToasts;
};

const Context = React.createContext({
  toasts,
  setToasts
});

function Toast(props) {}

Toast.Provider = Context.Provider;

Toast.toast = setToasts;

export default Toast;
