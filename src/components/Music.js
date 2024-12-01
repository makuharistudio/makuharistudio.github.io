import React, { useRef, useEffect } from 'react';

/* <audio ref={audioRef} src={audioFile} controls autoPlay loop /> */

function AudioPlayer({ audioFile }) {
  const audioRef = useRef();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
    }
  }, []);

  return (
    <div>
      <audio ref={audioRef} src={audioFile} autoPlay loop />
    </div>
  );
}

export default AudioPlayer;