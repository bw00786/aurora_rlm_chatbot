declare module "react-speech-recognition" {
  interface SpeechRecognitionOptions {
    continuous?: boolean;
    language?: string;
  }

  interface UseSpeechRecognitionResult {
    listening: boolean;
    transcript: string;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
  }

  const SpeechRecognition: {
    startListening: (options?: SpeechRecognitionOptions) => void;
    stopListening: () => void;
  };

  export function useSpeechRecognition(): UseSpeechRecognitionResult;

  export default SpeechRecognition;
}
