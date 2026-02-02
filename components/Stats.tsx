import React, { useMemo } from 'react';
import { Session } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  CartesianGrid, AreaChart, Area, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { TrendingUp, Target, Zap, Clock, Trophy, Activity, Calendar, PieChart as PieChartIcon } from 'lucide-react';

interface StatsProps {
  sessions: Session[];
}

export const Stats: React.FC<StatsProps> = ({ sessions }) => {
  
  // --- CALCUL DES DONNÉES ---

  const kpiData = useMemo(() => {
    let totalWins = 0, totalLosses = 0, totalDraws = 0, totalGames = 0;
    let accuracySum = 0, accuracyCount = 0;
    let maxStreak = 0, currentStreak = 0;
    let totalMinutes = 0;

    // Trier les sessions par date pour le calcul de streak
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedSessions.forEach(session => {
      totalWins += session.wins;
      totalLosses += session.losses;
      totalDraws += session.draws;
      
      // Temps estimé
      const timeMatch = session.timeControl.match(/(\d+)/);
      const minutesPerGame = timeMatch ? parseInt(timeMatch[1]) : 10;
      totalMinutes += (session.matches.length * minutesPerGame);

      // Accuracy
      session.matches.forEach(m => {
        if (m.accuracy) {
          accuracySum += m.accuracy;
          accuracyCount++;
        }
        
        // Streak Logic
        if (m.result === 'win') {
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else if (m.result === 'loss') {
          currentStreak = 0;
        }
      });
    });

    totalGames = totalWins + totalLosses + totalDraws;
    const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
    const avgAccuracy = accuracyCount > 0 ? Math.round(accuracySum / accuracyCount) : null;

    return { totalGames, totalWins, totalLosses, totalDraws, winRate, avgAccuracy, maxStreak, totalMinutes };
  }, [sessions]);

  const distributionData = useMemo(() => [
    { name: 'Victoires', value: kpiData.totalWins, color: '#10b981' },
    { name: 'Nuls', value: kpiData.totalDraws, color: '#9ca3af' },
    { name: 'Défaites', value: kpiData.totalLosses, color: '#ef4444' },
  ], [kpiData]);

  const evolutionData = useMemo(() => {
    let scoreBalance = 0;
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return sortedSessions.map(s => {
      scoreBalance += (s.wins - s.losses);
      return {
        date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        balance: scoreBalance,
        totalGames: s.wins + s.losses + s.draws
      };
    });
  }, [sessions]);

  const gameTypeData = useMemo(() => {
    const types = {
      chess: { name: 'Classique', wins: 0, total: 0 },
      rapid: { name: 'Rapide', wins: 0, total: 0 },
      blitz: { name: 'Blitz', wins: 0, total: 0 }
    };

    sessions.forEach(s => {
      const type = s.gameType as keyof typeof types;
      if (types[type]) {
        types[type].wins += s.wins;
        types[type].total += (s.wins + s.losses + s.draws);
      }
    });

    return Object.values(types).map(t => ({
      subject: t.name,
      A: t.total > 0 ? Math.round((t.wins / t.total) * 100) : 0,
      fullMark: 100
    }));
  }, [sessions]);

  const dayOfWeekData = useMemo(() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const data = days.map(d => ({ name: d, wins: 0, losses: 0, draws: 0 }));

    sessions.forEach(s => {
      const dayIndex = new Date(s.date).getDay();
      data[dayIndex].wins += s.wins;
      data[dayIndex].losses += s.losses;
      data[dayIndex].draws += s.draws;
    });
    return data;
  }, [sessions]);

  const recentForm = useMemo(() => {
    const allMatches: { result: string, date: string }[] = [];
    sessions.forEach(s => {
      s.matches.forEach(m => {
        allMatches.push({ result: m.result, date: s.date });
      });
    });
    // Sort by date desc and take last 10
    return allMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10).reverse();
  }, [sessions]);

  const opponentStats = useMemo(() => {
    const opps: Record<string, { wins: number, games: number }> = {};
    
    sessions.forEach(s => {
      if (!opps[s.opponentName]) opps[s.opponentName] = { wins: 0, games: 0 };
      opps[s.opponentName].wins += s.wins;
      opps[s.opponentName].games += (s.wins + s.losses + s.draws);
    });

    return Object.entries(opps)
      .map(([name, data]) => ({
        name: name.length > 10 ? name.substring(0, 10) + '...' : name,
        winRate: Math.round((data.wins / data.games) * 100),
        games: data.games
      }))
      .sort((a, b) => b.games - a.games) // Sort by most played
      .slice(0, 5); // Top 5 rivals
  }, [sessions]);

  // --- RENDU ---

  const KpiCard = ({ title, value, sub, icon, color }: any) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-full bg-${color}-50 text-${color}-600`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 border-b pb-4 border-gray-200">
        <Activity className="text-primary" size={28} />
        <h2 className="text-2xl font-bold text-dark">Centre de Statistiques</h2>
      </div>
      
      {/* 1. KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Taux de Victoire" 
          value={`${kpiData.winRate}%`} 
          sub={`Sur ${kpiData.totalGames} parties`}
          icon={<Trophy size={24} />} 
          color="yellow" 
        />
        <KpiCard 
          title="Meilleure Série" 
          value={kpiData.maxStreak} 
          sub="Victoires consécutives"
          icon={<Zap size={24} />} 
          color="blue" 
        />
        <KpiCard 
          title="Précision Moy." 
          value={kpiData.avgAccuracy ? `${kpiData.avgAccuracy}%` : "N/A"} 
          sub="Basé sur l'analyse"
          icon={<Target size={24} />} 
          color="red" 
        />
        <KpiCard 
          title="Temps de Jeu" 
          value={`${Math.round(kpiData.totalMinutes / 60)}h`} 
          sub="Estimation totale"
          icon={<Clock size={24} />} 
          color="green" 
        />
      </div>

      {/* 2. Main Row: Evolution & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Dynamique de Performance (Score Net)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  labelStyle={{fontWeight: 'bold', color: '#374151'}}
                />
                <Area type="monotone" dataKey="balance" stroke="#2563eb" fillOpacity={1} fill="url(#colorBalance)" name="Score Net" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie Chart (1/3 width) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
           <h3 className="text-lg font-bold text-gray-700 mb-4 w-full text-left flex items-center gap-2">
             <PieChartIcon size={20} className="text-gray-500" />
             Répartition Globale
           </h3>
           <div className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <Pie
                    data={distributionData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                   >
                     {distributionData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip />
                   <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* 3. Form & Day Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Recent Form */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-gray-700 mb-6">Forme du moment (10 derniers matchs)</h3>
           <div className="flex gap-2 justify-center items-center h-32">
              {recentForm.length > 0 ? recentForm.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group cursor-default relative">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md transform transition-transform group-hover:scale-110
                     ${m.result === 'win' ? 'bg-green-500' : m.result === 'loss' ? 'bg-red-500' : 'bg-gray-400'}`}>
                     {m.result === 'win' ? 'V' : m.result === 'loss' ? 'D' : 'N'}
                   </div>
                   <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-dark text-white p-1 rounded whitespace-nowrap z-10">
                     {new Date(m.date).toLocaleDateString()}
                   </div>
                   {i < recentForm.length - 1 && <div className="w-4 h-0.5 bg-gray-200"></div>}
                </div>
              )) : <p className="text-gray-400 italic">Pas assez de données</p>}
           </div>
         </div>

         {/* Day of Week Analysis */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-gray-500" />
              Performance par Jour
            </h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={dayOfWeekData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Legend />
                    <Bar dataKey="wins" fill="#10b981" name="Victoires" stackId="a" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="draws" fill="#9ca3af" name="Nuls" stackId="a" />
                    <Bar dataKey="losses" fill="#ef4444" name="Défaites" stackId="a" radius={[4, 4, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* 4. Secondary Grid: Game Types & Opponent Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Radar Chart: Game Types */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
           <h3 className="text-lg font-bold text-gray-700 mb-2 w-full text-left">Polyvalence (% Victoire)</h3>
           <div className="h-[300px] w-full max-w-md">
             <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={gameTypeData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Win Rate" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Bar Chart: Opponent Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-gray-700 mb-6">Top 5 Rivaux (% Victoire)</h3>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart layout="vertical" data={opponentStats} margin={{ left: 20 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                 <XAxis type="number" domain={[0, 100]} unit="%" hide />
                 <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                 <Tooltip cursor={{fill: 'transparent'}} />
                 <Bar dataKey="winRate" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} name="% Victoire">
                    {/* Color code based on win rate */}
                    {opponentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.winRate > 50 ? '#10b981' : entry.winRate < 50 ? '#ef4444' : '#f59e0b'} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

    </div>
  );
};
