export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const extractVideoFrames = async (
  videoFile: File,
  frameCount: number
): Promise<{ base64: string; mimeType: string }[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const frames: { base64: string; mimeType: string }[] = [];
    
    // Mute and play inline to handle browser policies
    video.muted = true;
    video.playsInline = true;

    video.preload = 'metadata';
    video.src = URL.createObjectURL(videoFile);

    video.onloadedmetadata = () => {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const duration = video.duration;
      
      if(duration <= 0) {
        reject(new Error("Video has no duration or is invalid."));
        return;
      }

      const interval = duration / (frameCount + 1);
      let capturedFrames = 0;

      const captureFrameAt = (time: number) => {
        video.currentTime = time;
      };

      video.onseeked = () => {
        if (!context) {
          reject('Could not get canvas context');
          return;
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        frames.push({
          base64: dataUrl.split(',')[1],
          mimeType: 'image/jpeg',
        });
        capturedFrames++;

        if (capturedFrames >= frameCount) {
          URL.revokeObjectURL(video.src);
          resolve(frames);
        } else {
          const nextTime = interval * (capturedFrames + 1);
          if (nextTime <= duration) {
            captureFrameAt(nextTime);
          } else {
             URL.revokeObjectURL(video.src);
             resolve(frames);
          }
        }
      };

      video.onerror = (e) => {
        URL.revokeObjectURL(video.src);
        reject(e);
      };

      // Start capturing the first frame
      captureFrameAt(interval);
    };

    video.onerror = (e) => {
      reject(e);
    };
  });
};
