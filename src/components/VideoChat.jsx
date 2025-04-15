import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "../styles/VideoChat.css";

const socket = io("http://localhost:5001"); // signaling server manzili o'zgartirildi

const VideoChat = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [mediaStarted, setMediaStarted] = useState(false);
  const [error, setError] = useState("");
  const [isWebRTCSupported, setIsWebRTCSupported] = useState(false);

  // WebRTC qo'llab-quvvatlanishini tekshirish
  useEffect(() => {
    // Brauzer mediaDevices API ni qo'llab-quvvatlaydimi?
    if (!navigator.mediaDevices) {
      setError("Sizning brauzeringiz WebRTC texnologiyasini qo'llab-quvvatlamaydi yoki HTTP protokoli orqali kirish qilinmoqda. HTTPS talab qilinadi. Localhost ham to'g'ri ishlaydi.");
      return;
    }
    
    setIsWebRTCSupported(true);
  }, []);

  const startMedia = async () => {
    try {
      setError("");
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Brauzeringiz kamera va mikrofonga kirishni qo'llab-quvvatlamaydi");
      }
      
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", event.candidate);
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      socket.on("offer", async (offer) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", answer);
      });

      socket.on("answer", async (answer) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("ice-candidate", async (candidate) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("ICE xatosi:", err);
        }
      });

      peerConnectionRef.current = pc;
      setMediaStarted(true);
      console.log("Media muvaffaqiyatli ishga tushdi");
    } catch (error) {
      console.error("Media xatosi:", error);
      setError("Kameraga kirish ruxsati berilmadi: " + (error.message || error));
    }
  };

  useEffect(() => {
    // Socket event listener setup
    const onDisconnect = () => {
      console.log("Socket uzildi");
    };

    socket.on("disconnect", onDisconnect);

    // Component unmount bo'lganda tozalash
    return () => {
      const pc = peerConnectionRef.current;
      if (pc) {
        pc.close();
      }
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("disconnect");
    };
  }, []);

  const createOffer = async () => {
    // Agar media ishga tushirilmagan bo'lsa, avval uni ishga tushiramiz
    if (!mediaStarted) {
      await startMedia();
    }
    
    const pc = peerConnectionRef.current;
    if (pc) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", offer);
      } catch (error) {
        console.error("Offer yaratishda xatolik:", error);
        setError("Qo'ng'iroqni boshlashda xatolik: " + error.message);
      }
    }
  };

  return (
    <div className="video-chat">
      <h1>WebRTC Video Chat</h1>
      {error && <div className="error-message">{error}</div>}
      
      {!isWebRTCSupported && (
        <div className="browser-support-message">
          <p>WebRTC ishlashi uchun:</p>
          <ul>
            <li>Zamonaviy brauzer ishlatayotganingizni tekshiring (Chrome, Firefox, Edge, Safari)</li>
            <li>HTTPS orqali kirish ta'minlangan bo'lishi kerak (yoki localhost orqali)</li>
            <li>Brauzeringizda JavaScript yoqilgan bo'lishi kerak</li>
            <li>Kamerangiz va mikrofoningiz mavjud va yoqilgan bo'lishi kerak</li>
          </ul>
        </div>
      )}
      
      <div className="video-container">
        <div className="video-box">
          <h2>Siz</h2>
          <video ref={localVideoRef} autoPlay muted />
          {isWebRTCSupported && !mediaStarted && (
            <button className="media-button" onClick={startMedia}>
              Kamerani yoqish
            </button>
          )}
        </div>
        <div className="video-box">
          <h2>Suhbatdosh</h2>
          <video ref={remoteVideoRef} autoPlay />
        </div>
      </div>
      <button 
        className="call-button" 
        onClick={createOffer}
        disabled={!mediaStarted}
      >
        Qo'ng'iroq qilish
      </button>
      
      <div className="info-message">
        <p><strong>Eslatma:</strong> WebRTC xavfsizlik sabablariga ko'ra faqat HTTPS yoki localhost orqali ishlaydi.</p>
        <p>Agar boshqa odamlar bilan bog'lanmoqchi bo'lsangiz, dasturni HTTPS serveriga joylashtirish kerak.</p>
      </div>
    </div>
  );
};

export default VideoChat; 