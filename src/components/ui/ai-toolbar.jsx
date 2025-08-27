{"code":"rate-limited","message":"You have hit the rate limit. Please upgrade to keep chatting.","providerLimitHit":false,"isRetryable":true}

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    setIsListening(true);
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        onTextChange(value + ' ' + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      toast({
        title: "Voice Error",
        description: "Voice recognition failed. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    
    // Auto-stop after 30 seconds
    setTimeout(() => {
      if (recognition) {
        recognition.stop();
      }
    }, 30000);
  };

   const handleAutocorrect = async () => {
          <button
            onClick={handleVoiceInput}
            disabled={isProcessing || isListening}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded hover:opacity-80 disabled:opacity-50 ${
              isListening ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            <Mic className={`w-3 h-3 ${isListening ? 'animate-pulse' : ''}`} />
            {isListening ? 'Stop' : 'Voice'}
          </button>