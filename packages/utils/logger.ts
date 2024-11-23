export const logger = {
    info: (message: string, meta?: any) => console.log(JSON.stringify({ level: 'info', message, ...meta })),
    error: (message: string, error?: any) => console.error(JSON.stringify({ level: 'error', message, error }))
  };
  