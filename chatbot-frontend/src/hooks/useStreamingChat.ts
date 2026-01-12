export const useStreamingChat = () => {
  const stream = async (
    payload: any,
    onToken: (token: string) => void,
    onComplete: (data: any) => void
  ) => {
    // TODO: Implement streaming logic
    try {
      const response = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        onToken(text);
      }

      onComplete({});
    } catch (error) {
      console.error('Streaming error:', error);
    }
  };

  return { stream };
};