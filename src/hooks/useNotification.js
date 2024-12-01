import { useSnackbar } from 'notistack';

export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  const notify = {
    success: (message) => {
      enqueueSnackbar(message, { variant: 'success' });
    },
    error: (message) => {
      enqueueSnackbar(message, { variant: 'error' });
    },
    warning: (message) => {
      enqueueSnackbar(message, { variant: 'warning' });
    },
    info: (message) => {
      enqueueSnackbar(message, { variant: 'info' });
    },
  };

  return notify;
}; 