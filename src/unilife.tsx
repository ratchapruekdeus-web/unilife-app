import { useState, useEffect, useRef } from "react";

const DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const initialTasks = [
  { id: 1, text: "ส่งรายงาน Data Structure", done: false, priority: "high", date: new Date().toISOString().split("T")[0], link: "" },
  { id: 2, text: "อ่านหนังสือ Calculus Ch.5", done: false, priority: "medium", date: new Date().toISOString().split("T")[0], link: "" },
  { id: 3, text: "ประชุมกลุ่ม Project", done: true, priority: "low", date: new Date().toISOString().split("T")[0], link: "https://meet.google.com" },
];

const initialLinks = [
  { id: 1, title: "Lecture Slides - OOP", url: "https://drive.google.com", category: "เรียน" },
  { id: 2, title: "Paper Reference - AI", url: "https://arxiv.org", category: "Research" },
];

const initialTimetable = [
  { id: 1, subject: "Data Structure", day: 1, start: "09:00", end: "12:00", room: "CB2204", color: "#6E6EFA" },
  { id: 2, subject: "Calculus II", day: 2, start: "13:00", end: "16:00", room: "SC1101", color: "#FF9F0A" },
  { id: 3, subject: "English Comm.", day: 3, start: "10:00", end: "12:00", room: "HB0301", color: "#30D158" },
  { id: 4, subject: "OOP Programming", day: 4, start: "08:00", end: "11:00", room: "CB2204", color: "#FF453A" },
  { id: 5, subject: "Physics", day: 5, start: "13:00", end: "16:00", room: "SC2202", color: "#BF5AF2" },
];

const initialGrades = [
  { id: 1, subject: "Data Structure", credits: 3, grade: "A" },
  { id: 2, subject: "Calculus II", credits: 3, grade: "B+" },
  { id: 3, subject: "English Comm.", credits: 2, grade: "A" },
];

const gradePoints = { "A": 4.0, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0.0 };

export default function UniLife() {
  const [tab, setTab] = useState("planner");
  const [tasks, setTasks] = useState(initialTasks);
  const [links, setLinks] = useState(initialLinks);
  const [timetable] = useState(initialTimetable);
  const [grades, setGrades] = useState(initialGrades);
  const [today] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Pomodoro
  const [pomMode, setPomMode] = useState("work"); // work | break
  const [pomSeconds, setPomSeconds] = useState(25 * 60);
  const [pomRunning, setPomRunning] = useState(false);
  const [pomCycles, setPomCycles] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (pomRunning) {
      timerRef.current = setInterval(() => {
        setPomSeconds(s => {
          if (s <= 1) {
            clearInterval(timerRef.current);
            setPomRunning(false);
            if (pomMode === "work") { setPomMode("break"); setPomSeconds(5 * 60); setPomCycles(c => c + 1); }
            else { setPomMode("work"); setPomSeconds(25 * 60); }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [pomRunning, pomMode]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const gpa = () => {
    const total = grades.reduce((a, g) => a + (gradePoints[g.grade] ?? 0) * g.credits, 0);
    const cr = grades.reduce((a, g) => a + g.credits, 0);
    return cr ? (total / cr).toFixed(2) : "0.00";
  };

  const todayStr = selectedDate.toISOString().split("T")[0];
  const todayTasks = tasks.filter(t => t.date === todayStr);

  // Calendar helpers
  const calStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const calDays = [];
  const firstDay = calStart.getDay();
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) calDays.push(i);

  return (
    <div style={{
      fontFamily: "-apple-system, 'SF Pro Display', Inter, system-ui, sans-serif",
      background: "#0A0A0F",
      minHeight: "100vh",
      color: "#F5F5F7",
      display: "flex",
      flexDirection: "column",
      maxWidth: 768,
      margin: "0 auto",
      position: "relative",
    }}>
      {/* Header */}
      <div style={{
        padding: "56px 24px 16px",
        background: "linear-gradient(180deg, #1C1C2E 0%, transparent 100%)",
      }}>
        <div style={{ fontSize: 13, color: "#8E8E93", letterSpacing: 0.5 }}>
          {DAYS[today.getDay()]} {today.getDate()} {MONTHS_TH[today.getMonth()]} {today.getFullYear() + 543}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginTop: 4 }}>
          {tab === "planner" && "แพลนเนอร์"}
          {tab === "tasks" && "งานที่ต้องทำ"}
          {tab === "links" && "ลิงก์ & ทรัพยากร"}
          {tab === "timetable" && "ตารางเรียน"}
          {tab === "timer" && "Pomodoro Timer"}
          {tab === "gpa" && "GPA Calculator"}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 100px" }}>

        {/* ───── PLANNER ───── */}
        {tab === "planner" && (
          <div>
            {/* Mini Calendar */}
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))} style={iconBtn}>‹</button>
                <span style={{ fontWeight: 600 }}>{MONTHS_TH[selectedDate.getMonth()]} {selectedDate.getFullYear() + 543}</span>
                <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))} style={iconBtn}>›</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, textAlign: "center" }}>
                {DAYS.map(d => <div key={d} style={{ fontSize: 11, color: "#8E8E93", paddingBottom: 4 }}>{d}</div>)}
                {calDays.map((d, i) => {
                  const isToday = d === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear();
                  const isSel = d === selectedDate.getDate();
                  const dateStr = d ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` : "";
                  const hasTasks = tasks.some(t => t.date === dateStr && !t.done);
                  return (
                    <button key={i} onClick={() => d && setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d))}
                      style={{
                        background: isSel ? "#6E6EFA" : "transparent",
                        color: isSel ? "#fff" : isToday ? "#6E6EFA" : d ? "#F5F5F7" : "transparent",
                        border: isToday && !isSel ? "1.5px solid #6E6EFA" : "none",
                        borderRadius: 8, padding: "6px 0", fontSize: 13, fontWeight: isSel || isToday ? 600 : 400,
                        cursor: d ? "pointer" : "default", position: "relative",
                      }}>
                      {d}
                      {hasTasks && <span style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#6E6EFA", display: "block" }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Today's Tasks */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 8, paddingLeft: 4 }}>
                งานวันที่ {selectedDate.getDate()} {MONTHS_TH[selectedDate.getMonth()]}
              </div>
              {todayTasks.length === 0 && (
                <div style={{ ...card, textAlign: "center", color: "#8E8E93", fontSize: 14, padding: 24 }}>
                  ว่างหมดเลย 🎉 ไม่มีงานวันนี้
                </div>
              )}
              {todayTasks.map(task => (
                <TaskCard key={task.id} task={task} onToggle={() => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, done: !t.done } : t))} />
              ))}
            </div>

            {/* Today's classes */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 8, paddingLeft: 4 }}>คลาสวันนี้</div>
              {timetable.filter(c => c.day === today.getDay()).length === 0
                ? <div style={{ ...card, textAlign: "center", color: "#8E8E93", fontSize: 14, padding: 24 }}>ไม่มีคลาสวันนี้ 📚</div>
                : timetable.filter(c => c.day === today.getDay()).map(c => (
                  <div key={c.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 4, height: 40, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{c.subject}</div>
                      <div style={{ fontSize: 12, color: "#8E8E93" }}>{c.start} – {c.end} · {c.room}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ───── TASKS ───── */}
        {tab === "tasks" && (
          <TasksView tasks={tasks} setTasks={setTasks} />
        )}

        {/* ───── LINKS ───── */}
        {tab === "links" && (
          <LinksView links={links} setLinks={setLinks} />
        )}

        {/* ───── TIMETABLE ───── */}
        {tab === "timetable" && (
          <div>
            {["จ", "อ", "พ", "พฤ", "ศ"].map((day, i) => {
              const dayClasses = timetable.filter(c => c.day === i + 1);
              return (
                <div key={day} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#8E8E93", fontWeight: 600, letterSpacing: 1, marginBottom: 6, paddingLeft: 4 }}>
                    วัน{["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์"][i]}
                  </div>
                  {dayClasses.length === 0
                    ? <div style={{ ...card, color: "#8E8E93", fontSize: 13, textAlign: "center", padding: 14 }}>ไม่มีคลาส</div>
                    : dayClasses.map(c => (
                      <div key={c.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 4, height: 44, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{c.subject}</div>
                          <div style={{ fontSize: 12, color: "#8E8E93" }}>{c.start} – {c.end}</div>
                        </div>
                        <div style={{ fontSize: 12, color: "#8E8E93", background: "#2C2C3E", padding: "4px 10px", borderRadius: 8 }}>{c.room}</div>
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ───── TIMER ───── */}
        {tab === "timer" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24 }}>
            {/* Mode toggle */}
            <div style={{ display: "flex", background: "#1C1C2E", borderRadius: 12, padding: 4, gap: 4, marginBottom: 40 }}>
              {["work", "break"].map(m => (
                <button key={m} onClick={() => { setPomMode(m); setPomSeconds(m === "work" ? 25 * 60 : 5 * 60); setPomRunning(false); }}
                  style={{ padding: "8px 20px", borderRadius: 10, border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all .2s",
                    background: pomMode === m ? "#6E6EFA" : "transparent", color: pomMode === m ? "#fff" : "#8E8E93" }}>
                  {m === "work" ? "🍅 โฟกัส" : "☕ พัก"}
                </button>
              ))}
            </div>

            {/* Ring */}
            <div style={{ position: "relative", width: 220, height: 220, marginBottom: 40 }}>
              <svg width="220" height="220" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
                <circle cx="110" cy="110" r="95" fill="none" stroke="#1C1C2E" strokeWidth="12" />
                <circle cx="110" cy="110" r="95" fill="none" stroke="#6E6EFA" strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 95}
                  strokeDashoffset={2 * Math.PI * 95 * (1 - pomSeconds / (pomMode === "work" ? 25 * 60 : 5 * 60))}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset .5s" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: -2, fontVariantNumeric: "tabular-nums" }}>{formatTime(pomSeconds)}</div>
                <div style={{ fontSize: 13, color: "#8E8E93", marginTop: 4 }}>{pomMode === "work" ? "เวลาโฟกัส" : "เวลาพัก"}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setPomRunning(r => !r)} style={{
                background: "#6E6EFA", color: "#fff", border: "none", borderRadius: 50, width: 64, height: 64,
                fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {pomRunning ? "⏸" : "▶"}
              </button>
              <button onClick={() => { setPomRunning(false); setPomSeconds(pomMode === "work" ? 25 * 60 : 5 * 60); }} style={{
                background: "#2C2C3E", color: "#F5F5F7", border: "none", borderRadius: 50, width: 64, height: 64,
                fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>↺</button>
            </div>

            <div style={{ marginTop: 32, fontSize: 13, color: "#8E8E93" }}>โฟกัสสำเร็จแล้ว {pomCycles} รอบ 🎉</div>
          </div>
        )}

        {/* ───── GPA ───── */}
        {tab === "gpa" && (
          <GPAView grades={grades} setGrades={setGrades} gpa={gpa} />
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 768,
        background: "rgba(15,15,25,0.85)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-around", padding: "10px 8px 20px",
        zIndex: 100,
      }}>
        {[
          { id: "planner", icon: "📅", label: "แพลนเนอร์" },
          { id: "tasks", icon: "✅", label: "งาน" },
          { id: "links", icon: "🔗", label: "ลิงก์" },
          { id: "timetable", icon: "🗓", label: "ตาราง" },
          { id: "timer", icon: "🍅", label: "โฟกัส" },
          { id: "gpa", icon: "📊", label: "GPA" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 3, padding: "4px 6px", transition: "opacity .15s",
            opacity: tab === t.id ? 1 : 0.45,
          }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{ fontSize: 10, color: tab === t.id ? "#6E6EFA" : "#8E8E93", fontWeight: tab === t.id ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Shared Styles ───
const card = {
  background: "rgba(28,28,46,0.8)",
  backdropFilter: "blur(12px)",
  borderRadius: 16,
  padding: "14px 16px",
  marginBottom: 10,
  border: "1px solid rgba(255,255,255,0.06)",
};
const iconBtn = {
  background: "none", border: "none", color: "#6E6EFA", fontSize: 22, cursor: "pointer", padding: "0 8px",
};
const input = {
  background: "#1C1C2E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
  color: "#F5F5F7", padding: "10px 12px", fontSize: 14, width: "100%", boxSizing: "border-box", outline: "none",
};

// ─── TaskCard ───
function TaskCard({ task, onToggle }) {
  const priorityColor = { high: "#FF453A", medium: "#FF9F0A", low: "#30D158" };
  return (
    <div style={{ ...card, display: "flex", alignItems: "flex-start", gap: 12 }}>
      <button onClick={onToggle} style={{
        width: 22, height: 22, borderRadius: "50%", border: `2px solid ${task.done ? "#6E6EFA" : "#3A3A4C"}`,
        background: task.done ? "#6E6EFA" : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 1,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff",
      }}>{task.done ? "✓" : ""}</button>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, textDecoration: task.done ? "line-through" : "none", color: task.done ? "#8E8E93" : "#F5F5F7", fontSize: 15 }}>
          {task.text}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: priorityColor[task.priority], background: `${priorityColor[task.priority]}22`, padding: "2px 8px", borderRadius: 6 }}>
            {task.priority === "high" ? "ด่วน" : task.priority === "medium" ? "ปานกลาง" : "ปกติ"}
          </span>
          {task.link && <a href={task.link} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#6E6EFA" }}>🔗 ลิงก์</a>}
        </div>
      </div>
    </div>
  );
}

// ─── TasksView ───
function TasksView({ tasks, setTasks }) {
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [priority, setPriority] = useState("medium");
  const [showForm, setShowForm] = useState(false);

  const add = () => {
    if (!text.trim()) return;
    setTasks(ts => [...ts, { id: Date.now(), text, link, priority, done: false, date: new Date().toISOString().split("T")[0] }]);
    setText(""); setLink(""); setShowForm(false);
  };

  return (
    <div>
      <button onClick={() => setShowForm(f => !f)} style={{
        width: "100%", background: "#6E6EFA", color: "#fff", border: "none", borderRadius: 14,
        padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 16,
      }}>+ เพิ่มงานใหม่</button>

      {showForm && (
        <div style={{ ...card, marginBottom: 16 }}>
          <input style={{ ...input, marginBottom: 10 }} placeholder="ชื่องาน..." value={text} onChange={e => setText(e.target.value)} />
          <input style={{ ...input, marginBottom: 10 }} placeholder="ลิงก์ (ถ้ามี)..." value={link} onChange={e => setLink(e.target.value)} />
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {["high", "medium", "low"].map(p => (
              <button key={p} onClick={() => setPriority(p)} style={{
                flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: priority === p ? "#6E6EFA" : "#2C2C3E", color: priority === p ? "#fff" : "#8E8E93",
              }}>{p === "high" ? "🔴 ด่วน" : p === "medium" ? "🟡 กลาง" : "🟢 ปกติ"}</button>
            ))}
          </div>
          <button onClick={add} style={{ width: "100%", background: "#30D158", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            บันทึก
          </button>
        </div>
      )}

      {["high", "medium", "low"].map(p => {
        const filtered = tasks.filter(t => t.priority === p);
        if (!filtered.length) return null;
        return (
          <div key={p}>
            <div style={{ fontSize: 12, color: "#8E8E93", letterSpacing: 0.5, marginBottom: 6, paddingLeft: 4 }}>
              {p === "high" ? "🔴 ด่วน" : p === "medium" ? "🟡 ปานกลาง" : "🟢 ปกติ"}
            </div>
            {filtered.map(task => (
              <TaskCard key={task.id} task={task}
                onToggle={() => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, done: !t.done } : t))} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── LinksView ───
function LinksView({ links, setLinks }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [cat, setCat] = useState("เรียน");
  const [showForm, setShowForm] = useState(false);
  const cats = ["เรียน", "Research", "งานกลุ่ม", "อื่นๆ"];

  const add = () => {
    if (!title.trim() || !url.trim()) return;
    setLinks(ls => [...ls, { id: Date.now(), title, url: url.startsWith("http") ? url : "https://" + url, category: cat }]);
    setTitle(""); setUrl(""); setShowForm(false);
  };

  return (
    <div>
      <button onClick={() => setShowForm(f => !f)} style={{
        width: "100%", background: "#6E6EFA", color: "#fff", border: "none", borderRadius: 14,
        padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 16,
      }}>+ เพิ่มลิงก์</button>

      {showForm && (
        <div style={{ ...card, marginBottom: 16 }}>
          <input style={{ ...input, marginBottom: 10 }} placeholder="ชื่อลิงก์..." value={title} onChange={e => setTitle(e.target.value)} />
          <input style={{ ...input, marginBottom: 10 }} placeholder="URL..." value={url} onChange={e => setUrl(e.target.value)} />
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: cat === c ? "#6E6EFA" : "#2C2C3E", color: cat === c ? "#fff" : "#8E8E93",
              }}>{c}</button>
            ))}
          </div>
          <button onClick={add} style={{ width: "100%", background: "#30D158", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            บันทึก
          </button>
        </div>
      )}

      {cats.map(c => {
        const filtered = links.filter(l => l.category === c);
        if (!filtered.length) return null;
        return (
          <div key={c}>
            <div style={{ fontSize: 12, color: "#8E8E93", letterSpacing: 0.5, marginBottom: 6, paddingLeft: 4 }}>{c}</div>
            {filtered.map(l => (
              <div key={l.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2C2C3E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔗</div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{l.title}</div>
                  <div style={{ fontSize: 11, color: "#8E8E93", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.url}</div>
                </div>
                <a href={l.url} target="_blank" rel="noreferrer" style={{
                  background: "#6E6EFA22", color: "#6E6EFA", padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: "none",
                }}>เปิด</a>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── GPAView ───
function GPAView({ grades, setGrades, gpa }) {
  const [subj, setSubj] = useState("");
  const [cr, setCr] = useState("3");
  const [grade, setGrade] = useState("A");
  const gradeOpts = Object.keys(gradePoints);

  const add = () => {
    if (!subj.trim()) return;
    setGrades(gs => [...gs, { id: Date.now(), subject: subj, credits: parseInt(cr), grade }]);
    setSubj("");
  };

  const gpaVal = parseFloat(gpa());
  const gpaColor = gpaVal >= 3.5 ? "#30D158" : gpaVal >= 3.0 ? "#6E6EFA" : gpaVal >= 2.5 ? "#FF9F0A" : "#FF453A";

  return (
    <div>
      {/* GPA Display */}
      <div style={{ ...card, textAlign: "center", padding: "32px 16px" }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: gpaColor, letterSpacing: -2, lineHeight: 1 }}>{gpa()}</div>
        <div style={{ fontSize: 14, color: "#8E8E93", marginTop: 8 }}>เกรดเฉลี่ยสะสม (GPA)</div>
        <div style={{ fontSize: 13, color: "#8E8E93", marginTop: 4 }}>
          {grades.reduce((a, g) => a + g.credits, 0)} หน่วยกิต
        </div>
      </div>

      {/* Add subject */}
      <div style={{ ...card }}>
        <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 10, fontWeight: 600 }}>เพิ่มวิชา</div>
        <input style={{ ...input, marginBottom: 8 }} placeholder="ชื่อวิชา..." value={subj} onChange={e => setSubj(e.target.value)} />
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <select value={cr} onChange={e => setCr(e.target.value)} style={{ ...input, width: "auto", flex: 1 }}>
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} หน่วยกิต</option>)}
          </select>
          <select value={grade} onChange={e => setGrade(e.target.value)} style={{ ...input, width: "auto", flex: 1 }}>
            {gradeOpts.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <button onClick={add} style={{ width: "100%", background: "#6E6EFA", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          เพิ่มวิชา
        </button>
      </div>

      {/* Grades list */}
      <div style={{ marginTop: 8 }}>
        {grades.map(g => (
          <div key={g.id} style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{g.subject}</div>
              <div style={{ fontSize: 12, color: "#8E8E93" }}>{g.credits} หน่วยกิต</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: gradePoints[g.grade] >= 3.5 ? "#30D158" : gradePoints[g.grade] >= 3.0 ? "#6E6EFA" : gradePoints[g.grade] >= 2.0 ? "#FF9F0A" : "#FF453A" }}>
              {g.grade}
            </div>
            <button onClick={() => setGrades(gs => gs.filter(x => x.id !== g.id))} style={{ background: "none", border: "none", color: "#FF453A", fontSize: 18, cursor: "pointer" }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}