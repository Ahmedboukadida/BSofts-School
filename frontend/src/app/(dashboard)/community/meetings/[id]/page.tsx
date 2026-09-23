'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  LiveKitRoom,
  VideoConference,
} from '@livekit/components-react';
import '@livekit/components-styles';
import {
  ArrowLeft,
  Users,
  Vote,
  FileText,
  Hand,
  Copy,
  Check,
  Radio,
  Clock,
  Shield,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import type { MeetingItem, MeetingParticipantItem, MeetingPointItem } from '@/types';

interface LiveMeetingPageProps {
  params: Promise<{ id: string }>;
}

export default function LiveMeetingRoomPage({ params }: LiveMeetingPageProps) {
  const resolvedParams = use(params);
  const meetingId = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<MeetingItem | null>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<MeetingParticipantItem | null>(null);

  // Side Panel Tabs
  const [activeTab, setActiveTab] = useState<'agenda' | 'participants' | 'info'>('agenda');
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Voting state (local storage of votes per pointId: { oui: n, non: n, abstain: n, myVote: 'YES'|'NO'|'ABSTAIN' })
  const [votingState, setVotingState] = useState<Record<string, { yes: number; no: number; abstain: number; myVote?: string }>>({});
  const [isVoting, setIsVoting] = useState<Record<string, boolean>>({});

  const joinMeetingRoom = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch meeting details
      const detailRes = await api.get(`/meetings/${meetingId}`);
      const mData: MeetingItem = detailRes.data;
      setMeeting(mData);

      // Initialize vote counts from points
      const initialVotes: Record<string, { yes: number; no: number; abstain: number; myVote?: string }> = {};
      mData.points?.forEach((pt) => {
        if (pt.votes) {
          const yes = pt.votes.filter((v) => v.value === 'YES').length;
          const no = pt.votes.filter((v) => v.value === 'NO').length;
          const abstain = pt.votes.filter((v) => v.value === 'ABSTAIN').length;
          initialVotes[pt.id] = { yes, no, abstain };
        }
      });
      setVotingState(initialVotes);

      // 2. Call Join endpoint to get LiveKit token
      const joinRes = await api.post(`/meetings/${meetingId}/join`, {});
      const { livekitToken: token, livekitUrl: url, participant } = joinRes.data;

      setLivekitToken(token);
      setLivekitUrl(url);
      setCurrentParticipant(participant);
      setIsHandRaised(Boolean(participant?.handRaised));
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Impossible d'accéder à la réunion. Vérifiez vos autorisations ou le lien d'accès."
      );
    } finally {
      setIsLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    joinMeetingRoom();
  }, [joinMeetingRoom]);

  // Hand raise toggle
  const toggleHandRaise = async () => {
    if (!currentParticipant?.id) return;
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);

    try {
      await api.post(`/meetings/${meetingId}/hand-raise`, {
        participantId: currentParticipant.id,
        handRaised: nextState,
      });
    } catch {
      setIsHandRaised(!nextState);
    }
  };

  // Vote on point
  const handleVote = async (pointId: string, value: 'YES' | 'NO' | 'ABSTAIN') => {
    if (!currentParticipant?.id) return;

    setIsVoting((prev) => ({ ...prev, [pointId]: true }));
    try {
      const res = await api.post(`/meetings/${meetingId}/points/${pointId}/vote`, {
        participantId: currentParticipant.id,
        value,
      });

      const { summary } = res.data;
      setVotingState((prev) => ({
        ...prev,
        [pointId]: {
          yes: summary.yes,
          no: summary.no,
          abstain: summary.abstain,
          myVote: value,
        },
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l’enregistrement du vote');
    } finally {
      setIsVoting((prev) => ({ ...prev, [pointId]: false }));
    }
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#242F40] text-[#FFFFFF] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-3 border-[#CCA43B] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold">Connexion à la salle LiveKit...</h2>
        <p className="text-xs text-[#E5E5E5]/70 mt-1">Initialisation du flux WebRTC et vérification des jetons d'accès</p>
      </div>
    );
  }

  if (error || !livekitToken || !livekitUrl) {
    return (
      <div className="min-h-screen bg-[#242F40] text-[#FFFFFF] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#FFFFFF] text-[#242F40] p-6 rounded-2xl border border-[#E5E5E5] text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold">Accès à la réunion impossible</h2>
          <p className="text-xs text-[#363636]/70 mt-2 mb-6">{error || 'Configuration LiveKit non trouvée.'}</p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/community/meetings')}
              className="text-xs border-[#E5E5E5]"
            >
              Retour aux réunions
            </Button>
            <Button
              onClick={joinMeetingRoom}
              className="bg-[#242F40] hover:bg-[#363636] text-[#FFFFFF] text-xs font-semibold"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#242F40] text-[#FFFFFF] flex flex-col">
      {/* Top Bar Header */}
      <header className="h-14 bg-[#242F40] border-b border-[#FFFFFF]/10 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/community/meetings')}
            className="text-[#E5E5E5] hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/10 h-8 px-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="text-xs">Quitter la salle</span>
          </Button>

          <div className="h-4 w-px bg-[#FFFFFF]/20 mx-1 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold text-[#FFFFFF] truncate max-w-[240px] sm:max-w-md">
                {meeting?.subject || meeting?.title}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE
              </span>
            </div>
            <div className="text-[10px] text-[#E5E5E5]/60 flex items-center gap-2">
              <span>{meeting?.establishment?.name || 'Établissement'}</span>
              <span>•</span>
              <span className="font-mono">{meeting?.startTime}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Hand Raise Button */}
          <Button
            onClick={toggleHandRaise}
            className={`text-xs h-8 px-3 rounded-lg flex items-center gap-1.5 transition-all ${
              isHandRaised
                ? 'bg-[#CCA43B] text-[#242F40] font-bold shadow-xs'
                : 'bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 text-[#FFFFFF]'
            }`}
            title={isHandRaised ? 'Baisser la main' : 'Lever la main'}
          >
            <Hand className={`w-3.5 h-3.5 ${isHandRaised ? 'text-[#242F40]' : 'text-[#CCA43B]'}`} />
            <span className="hidden sm:inline">{isHandRaised ? 'Main levée' : 'Lever la main'}</span>
          </Button>

          {/* Copy Link Button */}
          <Button
            onClick={copyRoomLink}
            variant="ghost"
            size="sm"
            className="text-[#E5E5E5] hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/10 h-8 px-2.5 text-xs"
            title="Copier le lien direct"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline ml-1">{copiedLink ? 'Copié' : 'Partager'}</span>
          </Button>

          {/* Leave Button */}
          <Button
            onClick={() => router.push('/community/meetings')}
            className="bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-[#FFFFFF] border border-red-500/30 h-8 px-3 text-xs font-semibold rounded-lg flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quitter</span>
          </Button>
        </div>
      </header>

      {/* Main Video & Interactive Side Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LiveKit Video Room Grid */}
        <div className="flex-1 bg-[#1a222e] relative flex flex-col overflow-hidden">
          <LiveKitRoom
            token={livekitToken}
            serverUrl={livekitUrl}
            connect={true}
            video={true}
            audio={true}
            data-lk-theme="default"
            className="h-full w-full flex flex-col justify-between"
          >
            <VideoConference />
          </LiveKitRoom>
        </div>

        {/* Side Panel: Agenda, Votes & Participants */}
        <div className="w-full lg:w-96 bg-[#242F40] border-t lg:border-t-0 lg:border-l border-[#FFFFFF]/10 flex flex-col shrink-0">
          {/* Tabs Navigation */}
          <div className="flex items-center border-b border-[#FFFFFF]/10 bg-[#242F40]">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'agenda'
                  ? 'border-[#CCA43B] text-[#CCA43B]'
                  : 'border-transparent text-[#E5E5E5]/70 hover:text-[#FFFFFF]'
              }`}
            >
              <Vote className="w-3.5 h-3.5" />
              <span>Ordre du jour & Votes</span>
            </button>

            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'participants'
                  ? 'border-[#CCA43B] text-[#CCA43B]'
                  : 'border-transparent text-[#E5E5E5]/70 hover:text-[#FFFFFF]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Participants</span>
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'info'
                  ? 'border-[#CCA43B] text-[#CCA43B]'
                  : 'border-transparent text-[#E5E5E5]/70 hover:text-[#FFFFFF]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Infos</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Tab 1: Agenda & Voting */}
            {activeTab === 'agenda' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#E5E5E5]/70 pb-1">
                  <span>Points de séance ({meeting?.points?.length || 0})</span>
                  <span className="text-[#CCA43B] font-semibold">Délibérations en direct</span>
                </div>

                {(!meeting?.points || meeting.points.length === 0) ? (
                  <div className="p-6 text-center text-xs text-[#E5E5E5]/50 bg-[#FFFFFF]/5 rounded-xl border border-[#FFFFFF]/10">
                    Aucun point formel n'a été enregistré pour cette séance.
                  </div>
                ) : (
                  meeting.points.map((point, index) => {
                    const votes = votingState[point.id] || { yes: 0, no: 0, abstain: 0 };
                    const totalVotes = votes.yes + votes.no + votes.abstain;
                    const votingInProgress = isVoting[point.id];

                    return (
                      <div
                        key={point.id}
                        className="p-3.5 bg-[#FFFFFF]/5 rounded-xl border border-[#FFFFFF]/10 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-[#CCA43B] uppercase">Point {index + 1}</span>
                            <h4 className="text-xs font-semibold text-[#FFFFFF] mt-0.5">{point.title}</h4>
                          </div>
                          {point.isVote && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#CCA43B]/20 text-[#CCA43B] border border-[#CCA43B]/30 shrink-0">
                              VOTE
                            </span>
                          )}
                        </div>

                        {point.description && (
                          <p className="text-[11px] text-[#E5E5E5]/70">{point.description}</p>
                        )}

                        {/* Interactive Voting Controls */}
                        {point.isVote && (
                          <div className="pt-2 border-t border-[#FFFFFF]/10 space-y-2">
                            <div className="text-[11px] font-semibold text-[#E5E5E5]/80">Votre vote :</div>
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                type="button"
                                disabled={votingInProgress}
                                onClick={() => handleVote(point.id, 'YES')}
                                className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                  votes.myVote === 'YES'
                                    ? 'bg-emerald-600 text-[#FFFFFF] border-emerald-500'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                }`}
                              >
                                OUI
                              </button>

                              <button
                                type="button"
                                disabled={votingInProgress}
                                onClick={() => handleVote(point.id, 'NO')}
                                className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                  votes.myVote === 'NO'
                                    ? 'bg-red-600 text-[#FFFFFF] border-red-500'
                                    : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                                }`}
                              >
                                NON
                              </button>

                              <button
                                type="button"
                                disabled={votingInProgress}
                                onClick={() => handleVote(point.id, 'ABSTAIN')}
                                className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                  votes.myVote === 'ABSTAIN'
                                    ? 'bg-slate-600 text-[#FFFFFF] border-slate-500'
                                    : 'bg-slate-500/10 text-slate-300 border-slate-500/30 hover:bg-slate-500/20'
                                }`}
                              >
                                ABSTENTION
                              </button>
                            </div>

                            {/* Tally results */}
                            <div className="bg-[#FFFFFF]/5 p-2 rounded-lg text-[10px] text-[#E5E5E5]/70 flex items-center justify-between font-mono">
                              <span>Résultats ({totalVotes} votes) :</span>
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-400 font-bold">Oui: {votes.yes}</span>
                                <span className="text-red-400 font-bold">Non: {votes.no}</span>
                                <span className="text-slate-300 font-bold">Abs: {votes.abstain}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 2: Participants */}
            {activeTab === 'participants' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#E5E5E5]/70 pb-1">
                  <span>Participants convoqués</span>
                  <span>{meeting?.participants?.length || 0} membres</span>
                </div>

                {(!meeting?.participants || meeting.participants.length === 0) ? (
                  <div className="p-6 text-center text-xs text-[#E5E5E5]/50 bg-[#FFFFFF]/5 rounded-xl border border-[#FFFFFF]/10">
                    Aucun participant inscrit.
                  </div>
                ) : (
                  meeting.participants.map((p) => {
                    const isMe = p.id === currentParticipant?.id;
                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          isMe
                            ? 'bg-[#CCA43B]/10 border-[#CCA43B]/40 text-[#FFFFFF]'
                            : 'bg-[#FFFFFF]/5 border-[#FFFFFF]/10 text-[#E5E5E5]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[#FFFFFF]/10 flex items-center justify-center font-bold text-[11px] text-[#CCA43B] shrink-0">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <div className="font-semibold truncate">
                              {p.name} {isMe && '(Vous)'}
                            </div>
                            <div className="text-[10px] text-[#E5E5E5]/50 truncate">{p.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {p.handRaised && (
                            <span className="p-1 rounded-full bg-[#CCA43B] text-[#242F40]" title="Main levée">
                              <Hand className="w-3 h-3" />
                            </span>
                          )}
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FFFFFF]/10 text-[#E5E5E5]/80">
                            {p.role}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 3: Infos & Documents */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#FFFFFF]/5 rounded-xl border border-[#FFFFFF]/10 space-y-2 text-xs">
                  <h4 className="font-bold text-[#CCA43B]">Informations sur la Salle</h4>
                  <div className="text-[#E5E5E5]/80 space-y-1">
                    <div>
                      <span className="font-semibold text-[#FFFFFF]">Salle LiveKit : </span>
                      <code className="text-[#CCA43B] font-mono">{meeting?.roomName}</code>
                    </div>
                    <div>
                      <span className="font-semibold text-[#FFFFFF]">Lieu / Mode : </span>
                      {meeting?.location}
                    </div>
                    <div>
                      <span className="font-semibold text-[#FFFFFF]">Établissement : </span>
                      {meeting?.establishment?.name}
                    </div>
                    <div>
                      <span className="font-semibold text-[#FFFFFF]">Date & Heure : </span>
                      {meeting?.date ? new Date(meeting.date).toLocaleDateString('fr-FR') : ''} à {meeting?.startTime}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-[#FFFFFF]/5 rounded-xl border border-[#FFFFFF]/10 space-y-2 text-xs">
                  <h4 className="font-bold text-[#CCA43B]">Invitation Partagée</h4>
                  <p className="text-[11px] text-[#E5E5E5]/70">
                    Transmettez ce lien aux participants autorisés pour rejoindre directement la visioconférence.
                  </p>
                  <Button
                    onClick={copyRoomLink}
                    variant="outline"
                    className="w-full border-[#FFFFFF]/20 text-[#FFFFFF] hover:bg-[#FFFFFF]/10 text-xs flex items-center justify-center gap-2"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Lien copié dans le presse-papier' : 'Copier le lien de la salle'}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
