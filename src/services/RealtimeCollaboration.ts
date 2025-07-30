/**
 * Real-time Collaboration Service
 * WebRTC peer-to-peer data sharing for Founders Club updates
 */

interface ReferralUpdate {
  userId: string;
  referralCount: number;
  timestamp: number;
  type: 'increment' | 'achievement' | 'leaderboard_change';
  metadata?: any;
}

interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel;
  lastSeen: number;
}

export class RealtimeCollaboration {
  private peers: Map<string, PeerConnection> = new Map();
  private localUserId: string | null = null;
  private isInitialized = false;
  private updateCallbacks: ((update: ReferralUpdate) => void)[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeWebRTC();
  }

  /**
   * Initialize WebRTC peer-to-peer connections
   */
  private async initializeWebRTC() {
    try {
      // Check WebRTC support
      if (!window.RTCPeerConnection) {
        console.warn('[⚠️ RealtimeCollab] WebRTC not supported, falling back to polling');
        return;
      }

      // Initialize signaling via broadcast channel (same-origin peers)
      this.setupBroadcastSignaling();
      
      // Start peer discovery
      this.startPeerDiscovery();
      
      // Setup heartbeat for connection health
      this.startHeartbeat();
      
      this.isInitialized = true;
      console.log('[🌐 RealtimeCollab] WebRTC collaboration initialized');
      
    } catch (error) {
      console.error('[❌ RealtimeCollab] Initialization failed:', error);
    }
  }

  /**
   * Setup broadcast channel for same-origin peer signaling
   */
  private setupBroadcastSignaling() {
    const signalingChannel = new BroadcastChannel('fitfi-founders-signaling');
    
    signalingChannel.addEventListener('message', async (event) => {
      const { type, from, data } = event.data;
      
      switch (type) {
        case 'peer-discovery':
          if (from !== this.localUserId) {
            await this.connectToPeer(from);
          }
          break;
          
        case 'webrtc-offer':
          if (data.to === this.localUserId) {
            await this.handleOffer(from, data.offer);
          }
          break;
          
        case 'webrtc-answer':
          if (data.to === this.localUserId) {
            await this.handleAnswer(from, data.answer);
          }
          break;
          
        case 'webrtc-ice':
          if (data.to === this.localUserId) {
            await this.handleIceCandidate(from, data.candidate);
          }
          break;
      }
    });
  }

  /**
   * Start peer discovery process
   */
  private startPeerDiscovery() {
    const signalingChannel = new BroadcastChannel('fitfi-founders-signaling');
    
    // Announce presence
    const announcePresence = () => {
      signalingChannel.postMessage({
        type: 'peer-discovery',
        from: this.localUserId,
        timestamp: Date.now()
      });
    };
    
    // Announce every 30 seconds
    setInterval(announcePresence, 30000);
    announcePresence(); // Initial announcement
  }

  /**
   * Connect to a discovered peer
   */
  private async connectToPeer(peerId: string) {
    if (this.peers.has(peerId)) return; // Already connected

    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Create data channel
      const dataChannel = peerConnection.createDataChannel('founders-updates', {
        ordered: true
      });

      this.setupDataChannel(dataChannel, peerId);
      this.setupPeerConnection(peerConnection, peerId);

      // Store peer connection
      this.peers.set(peerId, {
        id: peerId,
        connection: peerConnection,
        dataChannel,
        lastSeen: Date.now()
      });

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const signalingChannel = new BroadcastChannel('fitfi-founders-signaling');
      signalingChannel.postMessage({
        type: 'webrtc-offer',
        from: this.localUserId,
        data: { to: peerId, offer }
      });

    } catch (error) {
      console.error(`[❌ RealtimeCollab] Failed to connect to peer ${peerId}:`, error);
    }
  }

  /**
   * Setup data channel for peer communication
   */
  private setupDataChannel(dataChannel: RTCDataChannel, peerId: string) {
    dataChannel.onopen = () => {
      console.log(`[🔗 RealtimeCollab] Data channel opened with peer ${peerId}`);
    };

    dataChannel.onmessage = (event) => {
      try {
        const update: ReferralUpdate = JSON.parse(event.data);
        this.handleReferralUpdate(update);
      } catch (error) {
        console.error('[❌ RealtimeCollab] Failed to parse peer message:', error);
      }
    };

    dataChannel.onclose = () => {
      console.log(`[🔗 RealtimeCollab] Data channel closed with peer ${peerId}`);
      this.peers.delete(peerId);
    };
  }

  /**
   * Setup peer connection event handlers
   */
  private setupPeerConnection(peerConnection: RTCPeerConnection, peerId: string) {
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const signalingChannel = new BroadcastChannel('fitfi-founders-signaling');
        signalingChannel.postMessage({
          type: 'webrtc-ice',
          from: this.localUserId,
          data: { to: peerId, candidate: event.candidate }
        });
      }
    };

    peerConnection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel, peerId);
    };
  }

  /**
   * Handle WebRTC offer from peer
   */
  private async handleOffer(peerId: string, offer: RTCSessionDescriptionInit) {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });

      this.setupPeerConnection(peerConnection, peerId);

      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      const signalingChannel = new BroadcastChannel('fitfi-founders-signaling');
      signalingChannel.postMessage({
        type: 'webrtc-answer',
        from: this.localUserId,
        data: { to: peerId, answer }
      });

    } catch (error) {
      console.error('[❌ RealtimeCollab] Failed to handle offer:', error);
    }
  }

  /**
   * Handle WebRTC answer from peer
   */
  private async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit) {
    const peer = this.peers.get(peerId);
    if (peer) {
      try {
        await peer.connection.setRemoteDescription(answer);
      } catch (error) {
        console.error('[❌ RealtimeCollab] Failed to handle answer:', error);
      }
    }
  }

  /**
   * Handle ICE candidate from peer
   */
  private async handleIceCandidate(peerId: string, candidate: RTCIceCandidateInit) {
    const peer = this.peers.get(peerId);
    if (peer) {
      try {
        await peer.connection.addIceCandidate(candidate);
      } catch (error) {
        console.error('[❌ RealtimeCollab] Failed to handle ICE candidate:', error);
      }
    }
  }

  /**
   * Start heartbeat for connection health monitoring
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      
      // Remove stale connections (>5 minutes)
      for (const [peerId, peer] of this.peers.entries()) {
        if (now - peer.lastSeen > 300000) {
          peer.connection.close();
          this.peers.delete(peerId);
          console.log(`[🧹 RealtimeCollab] Removed stale peer: ${peerId}`);
        }
      }
      
      // Send heartbeat to active peers
      this.broadcastUpdate({
        userId: this.localUserId!,
        referralCount: 0, // Will be updated with real data
        timestamp: now,
        type: 'heartbeat' as any
      });
      
    }, 60000); // Every minute
  }

  /**
   * Set local user ID for peer identification
   */
  setUserId(userId: string) {
    this.localUserId = userId;
  }

  /**
   * Broadcast referral update to all connected peers
   */
  broadcastUpdate(update: ReferralUpdate) {
    if (!this.isInitialized) return;

    const message = JSON.stringify(update);
    
    for (const peer of this.peers.values()) {
      if (peer.dataChannel.readyState === 'open') {
        try {
          peer.dataChannel.send(message);
          peer.lastSeen = Date.now();
        } catch (error) {
          console.error('[❌ RealtimeCollab] Failed to send update to peer:', error);
        }
      }
    }
  }

  /**
   * Handle incoming referral update from peer
   */
  private handleReferralUpdate(update: ReferralUpdate) {
    // Validate update
    if (!update.userId || typeof update.referralCount !== 'number') {
      return;
    }

    // Ignore own updates
    if (update.userId === this.localUserId) {
      return;
    }

    // Notify subscribers
    this.updateCallbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('[❌ RealtimeCollab] Update callback failed:', error);
      }
    });

    console.log(`[📡 RealtimeCollab] Received update from ${update.userId}: ${update.referralCount} referrals`);
  }

  /**
   * Subscribe to referral updates
   */
  onUpdate(callback: (update: ReferralUpdate) => void) {
    this.updateCallbacks.push(callback);
    
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get collaboration statistics
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      connectedPeers: this.peers.size,
      localUserId: this.localUserId,
      webrtcSupported: !!window.RTCPeerConnection
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    for (const peer of this.peers.values()) {
      peer.connection.close();
    }
    
    this.peers.clear();
    this.updateCallbacks = [];
    this.isInitialized = false;
  }
}

export const realtimeCollaboration = new RealtimeCollaboration();