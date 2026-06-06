import { useState } from 'react';
import { PlaySquare, Search, Filter } from 'lucide-react';
import './Videos.css';

const VIDEOS = [
  // Chest
  { id:'5r1dEXFjO_c', title:'Perfect Bench Press Form', muscle:'Chest',    level:'Intermediate', duration:'8:24' },
  { id:'RFWD-j0j3Ew', title:'Push-Up Mastery Guide',   muscle:'Chest',    level:'Beginner',     duration:'6:15' },
  // Back
  { id:'4AqFIc7mHz4', title:'Deadlift Technique 101',  muscle:'Back',     level:'Intermediate', duration:'12:30' },
  { id:'eGo4IYlbE5g', title:'Pull-Up Perfect Form',    muscle:'Back',     level:'Beginner',     duration:'7:42' },
  // Shoulders
  { id:'qEwKCR5JCog', title:'Overhead Press Guide',    muscle:'Shoulders',level:'Intermediate', duration:'9:10' },
  { id:'Vwx5xAK-Azw', title:'Lateral Raise Technique', muscle:'Shoulders',level:'Beginner',     duration:'5:30' },
  // Legs
  { id:'ultWZbUMPL8', title:'Squat Like a Pro',        muscle:'Legs',     level:'Intermediate', duration:'11:20' },
  { id:'JDAcVcVNLqE', title:'Lunge Variations Guide',  muscle:'Legs',     level:'Beginner',     duration:'6:50' },
  // Core
  { id:'1g4V9V8vu40', title:'Core Workout Masterclass',muscle:'Core',     level:'Intermediate', duration:'14:00' },
  { id:'9mdbtEHI5To', title:'Plank Progression Plan',  muscle:'Core',     level:'Beginner',     duration:'5:00' },
  // Cardio
  { id:'ml6cT4AZdqI', title:'HIIT Cardio Full Routine', muscle:'Cardio',   level:'Advanced',     duration:'20:15' },
  { id:'7Y3A3otnwn8', title:'Beginner Cardio Workout',  muscle:'Cardio',   level:'Beginner',     duration:'15:00' },
  // Arms
  { id:'ykJmrZ5v0Oo', title:'Bicep Curl Perfection',    muscle:'Arms',     level:'Beginner',     duration:'5:45' },
  { id:'sFBfvJIeXcE', title:'Tricep Dip Masterclass',   muscle:'Arms',     level:'Intermediate', duration:'6:20' },
  // Flexibility
  { id:'qFpSXoEQhbM', title:'Full Body Stretching Flow',muscle:'Flexibility',level:'Beginner', duration:'18:00' },
  { id:'g_tea8ZNk5A', title:'Yoga for Athletes',        muscle:'Flexibility',level:'Intermediate',duration:'22:30' },
];

const MUSCLES = ['All', ...Array.from(new Set(VIDEOS.map(v => v.muscle)))];
const LEVELS  = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const LEVEL_COLORS = { Beginner:'#2ed573', Intermediate:'#ffa502', Advanced:'#ff4757' };

export default function ExerciseVideos() {
  const [activeVideo, setActiveVideo] = useState(null);
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState('All');
  const [level,  setLevel]  = useState('All');

  const filtered = VIDEOS.filter(v => {
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = muscle === 'All' || v.muscle === muscle;
    const matchLevel  = level  === 'All' || v.level  === level;
    return matchSearch && matchMuscle && matchLevel;
  });

  return (
    <div className="videos-page animate-fade-in">
      {/* Search & Filters */}
      <div className="videos-toolbar">
        <div className="video-search">
          <Search size={16} className="vs-icon" />
          <input
            className="form-input"
            style={{ paddingLeft: 40 }}
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={14} />
          {MUSCLES.map(m => (
            <button key={m} className={`tag ${muscle===m?'active':''}`} onClick={() => setMuscle(m)}>{m}</button>
          ))}
        </div>
        <div className="filter-group">
          {LEVELS.map(l => (
            <button key={l} className={`tag ${level===l?'active':''}`} onClick={() => setLevel(l)}
              style={level===l ? { background: LEVEL_COLORS[l]+'22', borderColor: LEVEL_COLORS[l], color: LEVEL_COLORS[l] } : {}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Featured / Active Player */}
      {activeVideo && (
        <div className="video-player-section animate-fade-up">
          <div className="video-player-card card">
            <div className="yt-embed-wrap">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="player-info">
              <h2 className="player-title">{activeVideo.title}</h2>
              <div className="player-meta">
                <span className="badge badge-accent">{activeVideo.muscle}</span>
                <span className="badge" style={{ background: LEVEL_COLORS[activeVideo.level]+'22', color: LEVEL_COLORS[activeVideo.level] }}>
                  {activeVideo.level}
                </span>
                <span style={{ color:'var(--text-muted)', fontSize:'0.85rem', fontFamily:'var(--font-mono)' }}>
                  ⏱ {activeVideo.duration}
                </span>
              </div>
              <p style={{ fontSize:'0.9rem', color:'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
                Master perfect form and technique for <strong style={{color:'var(--text-primary)'}}>{activeVideo.title}</strong>. 
                This video covers proper posture, common mistakes, and progression tips to maximize results and prevent injury.
              </p>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => setActiveVideo(null)}>
                ✕ Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div style={{ marginTop: activeVideo ? 24 : 0 }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Exercise Library</h2>
            <p className="section-subtitle">{filtered.length} videos — click to watch with expert form guidance</p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <PlaySquare size={56} />
            <h3>No videos found</h3>
            <p>Try changing your search or filter criteria</p>
          </div>
        ) : (
          <div className="videos-grid">
            {filtered.map(video => (
              <div
                key={video.id}
                className={`video-card card ${activeVideo?.id === video.id ? 'active' : ''}`}
                onClick={() => setActiveVideo(video)}
              >
                <div className="video-thumb">
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                    alt={video.title}
                    loading="lazy"
                  />
                  <div className="video-play-overlay">
                    <div className="play-btn-circle">
                      <PlaySquare size={28} />
                    </div>
                  </div>
                  <div className="video-duration">{video.duration}</div>
                </div>
                <div className="video-info">
                  <h3 className="video-title">{video.title}</h3>
                  <div className="video-tags">
                    <span className="badge badge-accent" style={{ fontSize:'0.7rem' }}>{video.muscle}</span>
                    <span className="badge" style={{
                      fontSize:'0.7rem',
                      background: LEVEL_COLORS[video.level]+'22',
                      color: LEVEL_COLORS[video.level]
                    }}>
                      {video.level}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
