import React, { useState } from "react";
import { arenaStore } from "@/lib/store";
import { Tournament, User } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Award,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Plus,
  Trash2,
} from "lucide-react";

interface TournamentsViewProps {
  currentUser: User | null;
  onRequireLogin: () => void;
  onRegisterSubmit: (tournament: Tournament, details: {
    teamName: string;
    captainName: string;
    captainPhone: string;
    players: string[];
    notes?: string;
  }) => void;
}

export function TournamentsView({
  currentUser,
  onRequireLogin,
  onRegisterSubmit,
}: TournamentsViewProps) {
  const tournaments = arenaStore.getTournaments();
  const [filter, setFilter] = useState<"ALL" | "UPCOMING" | "FILLING_FAST" | "COMPLETED">("ALL");
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Registration form state
  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState(currentUser?.username || "");
  const [captainPhone, setCaptainPhone] = useState(currentUser?.phone || "");
  const [players, setPlayers] = useState<string[]>(["Player 1", "Player 2"]);
  const [notes, setNotes] = useState("");
  const [regError, setRegError] = useState<string | null>(null);

  const filteredTournaments = tournaments.filter((t) => {
    if (filter === "ALL") return true;
    if (filter === "UPCOMING") return t.status === "UPCOMING" || t.status === "FILLING_FAST";
    if (filter === "COMPLETED") return t.status === "COMPLETED";
    return t.status === filter;
  });

  const handleOpenRegister = (t: Tournament) => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    setActiveTournament(t);
    setCaptainName(currentUser.username);
    setCaptainPhone(currentUser.phone);
    // Initialize players array based on min team size
    const initialPlayers = Array.from({ length: t.teamSizeMin }, (_, idx) =>
      idx === 0 ? currentUser.username : `Player ${idx + 1}`
    );
    setPlayers(initialPlayers);
    setIsRegistering(true);
  };

  const handleAddPlayer = () => {
    if (!activeTournament) return;
    if (players.length < activeTournament.teamSizeMax) {
      setPlayers([...players, `Player ${players.length + 1}`]);
    }
  };

  const handleRemovePlayer = (idx: number) => {
    if (!activeTournament) return;
    if (players.length > activeTournament.teamSizeMin) {
      setPlayers(players.filter((_, i) => i !== idx));
    }
  };

  const handlePlayerNameChange = (idx: number, name: string) => {
    const updated = [...players];
    updated[idx] = name;
    setPlayers(updated);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!activeTournament) return;

    if (!teamName.trim()) {
      setRegError("Please enter your team name.");
      return;
    }

    if (players.some((p) => !p.trim())) {
      setRegError("Please specify names for all squad players.");
      return;
    }

    onRegisterSubmit(activeTournament, {
      teamName,
      captainName,
      captainPhone,
      players,
      notes,
    });

    setIsRegistering(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00E676] rounded-full" />
            <span className="text-xs uppercase font-heading font-semibold text-[#00E676] tracking-widest">
              Pixel Arena Championship Series
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-white uppercase tracking-tight mt-1">
            TOURNAMENTS & CUPS
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Compete in sanctioned box cricket leagues, pickleball open doubles, and badminton showdowns for trophies, cash prizes, and district rankings.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-[#111111] p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-md font-heading text-xs font-bold uppercase tracking-wider transition-all ${
              filter === "ALL" ? "bg-[#00E676] text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            All Cups
          </button>
          <button
            onClick={() => setFilter("UPCOMING")}
            className={`px-3 py-1.5 rounded-md font-heading text-xs font-bold uppercase tracking-wider transition-all ${
              filter === "UPCOMING" ? "bg-[#00E676] text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            Active & Open
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`px-3 py-1.5 rounded-md font-heading text-xs font-bold uppercase tracking-wider transition-all ${
              filter === "COMPLETED" ? "bg-[#00E676] text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            Past Champions
          </button>
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((t) => {
          const fillPercentage = Math.round((t.registeredCount / t.maxTeams) * 100);
          const isFull = t.registeredCount >= t.maxTeams;
          const isCompleted = t.status === "COMPLETED";

          return (
            <div
              key={t.id}
              className="bg-[#111111] border border-[#262626] hover:border-[#00E676]/40 rounded-xl overflow-hidden flex flex-col justify-between transition-all group shadow-xl"
            >
              <div>
                {/* Banner & Badges */}
                <div className="relative h-48 w-full bg-neutral-900 overflow-hidden">
                  <img
                    src={t.banner}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Sport Badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 backdrop-blur-md border border-neutral-700 text-[#00E676] text-[10px] font-heading font-bold uppercase rounded">
                    {t.sport}
                  </span>

                  {/* Status Badge */}
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-heading font-bold uppercase rounded shadow ${
                      isCompleted
                        ? "bg-neutral-800 text-neutral-400 border border-neutral-700"
                        : isFull
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : t.status === "FILLING_FAST"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40"
                    }`}
                  >
                    {isCompleted
                      ? "Completed"
                      : isFull
                      ? "Housefull"
                      : t.status === "FILLING_FAST"
                      ? "Filling Fast"
                      : "Registration Open"}
                  </span>

                  {/* Prize pool overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase font-mono">
                        Total Prize Pool
                      </span>
                      <span className="text-xl font-extrabold font-heading text-[#00E676] drop-shadow">
                        {formatINR(t.prizePool)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 block uppercase font-mono">
                        Entry Fee
                      </span>
                      <span className="text-sm font-bold font-mono text-white">
                        {formatINR(t.entryFee)} / team
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <h3 className="font-heading font-bold text-lg text-white group-hover:text-[#00E676] transition-colors line-clamp-1">
                    {t.name}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {t.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-neutral-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#00E676]" />
                      <span>{t.startDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#00E676]" />
                      <span>
                        {t.teamSizeMin === t.teamSizeMax
                          ? `${t.teamSizeMin} Players`
                          : `${t.teamSizeMin}-${t.teamSizeMax} Players`}
                      </span>
                    </div>
                  </div>

                  {/* Registration Progress */}
                  {!isCompleted && (
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-neutral-400">Team Slots</span>
                        <span className="text-neutral-200">
                          {t.registeredCount} / {t.maxTeams} Teams
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00E676] rounded-full transition-all"
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Winner banner for completed */}
                  {isCompleted && t.winners && t.winners.length > 0 && (
                    <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
                      <span className="text-amber-400 font-bold block mb-0.5">🏆 {t.winners[0].rank}:</span>
                      <span className="text-white font-medium">{t.winners[0].team}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTournament(t)}
                  className="py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-heading font-semibold uppercase tracking-wider rounded-lg border border-neutral-700 cursor-pointer transition-colors"
                >
                  View Details
                </button>

                {!isCompleted && !isFull ? (
                  <button
                    onClick={() => handleOpenRegister(t)}
                    className="py-2.5 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(0,230,118,0.2)] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Register</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTournament(t)}
                    className="py-2.5 bg-neutral-800 text-neutral-400 text-xs font-heading uppercase rounded-lg cursor-pointer"
                  >
                    {isCompleted ? "View Results" : "Waitlist"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {activeTournament && !isRegistering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0e0e0e] border border-neutral-800 rounded-xl p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setActiveTournament(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-2.5 py-1 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-xs font-heading font-bold uppercase rounded">
              {activeTournament.sport} • {activeTournament.format} Format
            </span>
            <h2 className="text-2xl font-bold font-heading text-white mt-2">
              {activeTournament.name}
            </h2>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {activeTournament.description}
            </p>

            {/* Prizes table */}
            <div className="my-6">
              <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Prize Breakdown</span>
              </h4>
              <div className="bg-[#141414] border border-neutral-800 rounded-lg overflow-hidden">
                {activeTournament.prizes.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border-b border-neutral-800/80 last:border-0 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{p.rank}</span>
                      {p.trophy && <span className="text-neutral-400 text-[11px]">{p.trophy}</span>}
                    </div>
                    <span className="font-mono font-bold text-[#00E676] text-sm">
                      {formatINR(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="mb-6">
              <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Official Tournament Rules</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-400 list-disc list-inside">
                {activeTournament.rules.map((rule, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fixtures or Results if any */}
            {activeTournament.results && activeTournament.results.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-300 mb-2">
                  Match Results & Scores
                </h4>
                <div className="space-y-2">
                  {activeTournament.results.map((r, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white block">{r.match}</span>
                        <span className="text-neutral-400 font-mono text-[11px]">{r.score}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-[#00E676]/20 text-[#00E676] font-heading font-bold rounded">
                        {r.winner}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {activeTournament.status !== "COMPLETED" && (
              <div className="pt-4 border-t border-neutral-800 flex justify-end">
                <button
                  onClick={() => handleOpenRegister(activeTournament)}
                  className="py-3 px-6 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md"
                >
                  Proceed to Team Registration
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {isRegistering && activeTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0e0e0e] border border-neutral-800 rounded-xl p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setIsRegistering(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-2.5 py-1 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-xs font-heading font-bold uppercase rounded">
              Entry Fee: {formatINR(activeTournament.entryFee)}
            </span>
            <h3 className="text-xl font-bold font-heading text-white mt-2">
              REGISTER: {activeTournament.name}
            </h3>

            {regError && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded">
                {regError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Mathura Strikers"
                  className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:outline-none focus:border-[#00E676]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1">
                    Captain Name
                  </label>
                  <input
                    type="text"
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-heading font-semibold uppercase text-neutral-300 mb-1">
                    Captain Phone
                  </label>
                  <input
                    type="text"
                    value={captainPhone}
                    onChange={(e) => setCaptainPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Squad Players */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-heading font-semibold uppercase text-neutral-300">
                    Squad Player Names ({players.length}/{activeTournament.teamSizeMax})
                  </label>
                  {players.length < activeTournament.teamSizeMax && (
                    <button
                      type="button"
                      onClick={handleAddPlayer}
                      className="text-xs text-[#00E676] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Player</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {players.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500 font-mono w-6">#{idx + 1}</span>
                      <input
                        type="text"
                        value={p}
                        onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                        placeholder={`Player ${idx + 1} Full Name`}
                        className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:outline-none focus:border-[#00E676]"
                        required
                      />
                      {players.length > activeTournament.teamSizeMin && (
                        <button
                          type="button"
                          onClick={() => handleRemovePlayer(idx)}
                          className="p-1.5 text-neutral-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#00E676] hover:bg-[#00c864] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-md shadow-[0_0_20px_rgba(0,230,118,0.25)] flex items-center justify-center gap-2"
                >
                  <span>Pay Entry Fee ({formatINR(activeTournament.entryFee)}) via UPI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TournamentsView;
