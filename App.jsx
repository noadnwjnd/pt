import React, { useMemo, useRef, useState } from "react";

function formatDateValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getTodayString() {
  return formatDateValue(new Date());
}

function parseDate(dateString) {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function parseDateTime(date, time) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0);
}

function addDays(dateString, days) {
  const date = parseDate(dateString);
  date.setDate(date.getDate() + days);
  return formatDateValue(date);
}

function addOneYear(dateString) {
  const date = parseDate(dateString);
  date.setFullYear(date.getFullYear() + 1);
  return formatDateValue(date);
}

function formatDateLabel(dateString) {
  const date = parseDate(dateString);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getStartOfWeekSunday(dateString) {
  const date = parseDate(dateString);
  date.setDate(date.getDate() - date.getDay());
  return formatDateValue(date);
}

function makeDateRange(startDate, days) {
  return Array.from({ length: days }, (_, i) => addDays(startDate, i));
}

function formatPhone(value) {
  const numbers = value.replace(/[^0-9]/g, "").slice(0, 11);
  if (numbers.length < 4) return numbers;
  if (numbers.length < 8) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
}

const TODAY = getTodayString();
const NOW = new Date();
const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00",
];

const DEMO_ACCOUNTS = [
  { id: "member-noah", role: "member", label: "노아 회원", memberId: "m1" },
  { id: "trainer-kim", role: "trainer", label: "김트레이너", trainerId: "t1" },
  { id: "admin", role: "admin", label: "센터 관리자" },
];

const INITIAL_TRAINERS = [
  { id: "t1", name: "김트레이너", phone: "010-9000-1111", specialty: "체형교정" },
  { id: "t2", name: "박트레이너", phone: "010-9000-2222", specialty: "다이어트" },
  { id: "t3", name: "이트레이너", phone: "010-9000-3333", specialty: "근력증가" },
];

const INITIAL_MEMBERS = [
  {
    id: "m1",
    name: "노아",
    phone: "010-1111-2222",
    trainerId: "t1",
    totalSessions: 22,
    remainingSessions: 17,
    firstLessonDate: addDays(TODAY, -3),
    expiryDate: addOneYear(addDays(TODAY, -3)),
  },
  {
    id: "m2",
    name: "민지",
    phone: "010-3333-4444",
    trainerId: "t2",
    totalSessions: 8,
    remainingSessions: 4,
    firstLessonDate: addDays(TODAY, -5),
    expiryDate: addOneYear(addDays(TODAY, -5)),
  },
  {
    id: "m3",
    name: "수현",
    phone: "010-5555-6666",
    trainerId: "t1",
    totalSessions: 57,
    remainingSessions: 56,
    firstLessonDate: addDays(TODAY, -2),
    expiryDate: addOneYear(addDays(TODAY, -2)),
  },
];

const INITIAL_BOOKINGS = [
  { id: "b1", trainerId: "t1", memberId: "m1", date: TODAY, time: "10:00", status: "confirmed" },
  { id: "b2", trainerId: "t1", memberId: "m3", date: TODAY, time: "13:00", status: "awaiting_member_confirmation" },
  { id: "b3", trainerId: "t2", memberId: "m2", date: TODAY, time: "11:00", status: "confirmed" },
  { id: "b4", trainerId: "t1", memberId: "m1", date: addDays(TODAY, 1), time: "09:00", status: "confirmed" },
  { id: "b5", trainerId: "t1", memberId: "m3", date: addDays(TODAY, 2), time: "15:00", status: "confirmed" },
  { id: "b6", trainerId: "t2", memberId: "m2", date: addDays(TODAY, 5), time: "18:00", status: "confirmed" },
];

const INITIAL_REPORTS = [
  {
    id: "r1",
    memberId: "m1",
    message: "최근 수업 기록이 반영되었습니다. 남은 횟수를 확인해 주세요.",
    createdAt: `${TODAY} 12:10`,
  },
];

function isUpcoming(date, time) {
  return parseDateTime(date, time).getTime() >= NOW.getTime();
}

function canCancel(date, time) {
  const diffHours = (parseDateTime(date, time).getTime() - NOW.getTime()) / (1000 * 60 * 60);
  return diffHours >= 48;
}

function getBookingStatusLabel(status) {
  return {
    requested: "예약 요청",
    confirmed: "예약 확정",
    awaiting_member_confirmation: "회원 확인 대기",
    deducted: "차감 완료",
    cancelled: "취소됨",
  }[status] || status;
}

function getTone(status) {
  return {
    requested: { bg: "#f5f3ff", border: "#c4b5fd", text: "#6d28d9" },
    confirmed: { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8" },
    awaiting_member_confirmation: { bg: "#fffbeb", border: "#fcd34d", text: "#b45309" },
    deducted: { bg: "#ecfdf5", border: "#86efac", text: "#047857" },
    cancelled: { bg: "#fff1f2", border: "#fda4af", text: "#be123c" },
    default: { bg: "#f8fafc", border: "#cbd5e1", text: "#334155" },
  }[status] || { bg: "#f8fafc", border: "#cbd5e1", text: "#334155" };
}

function getMemberStatus(member) {
  if (member.expiryDate < TODAY) return "expired";
  if (member.remainingSessions <= 0) return "completed";
  return "active";
}

function getMemberStatusLabel(member) {
  return {
    active: "사용중",
    expired: "만료",
    completed: "사용완료",
  }[getMemberStatus(member)];
}

function getMemberStatusTone(member) {
  const status = getMemberStatus(member);
  return {
    active: { bg: "#ecfdf5", border: "#86efac", text: "#047857" },
    expired: { bg: "#fff1f2", border: "#fda4af", text: "#be123c" },
    completed: { bg: "#fffbeb", border: "#fcd34d", text: "#b45309" },
  }[status];
}

function getDaysUntilExpiry(expiryDate) {
  return Math.floor((parseDate(expiryDate).getTime() - parseDate(TODAY).getTime()) / (1000 * 60 * 60 * 24));
}

function getLastLessonDate(memberId, bookings) {
  const completed = bookings
    .filter((b) => b.memberId === memberId && b.status === "deducted")
    .sort((a, b) => parseDateTime(b.date, b.time) - parseDateTime(a.date, a.time));
  return completed[0] ? `${completed[0].date} ${completed[0].time}` : "없음";
}

function getUsedSessions(member) {
  return Math.max(0, member.totalSessions - member.remainingSessions);
}

function getAlertItems(members, trainers, bookings) {
  return members.flatMap((member) => {
    const trainer = trainers.find((t) => t.id === member.trainerId);
    const items = [];
    const daysUntilExpiry = getDaysUntilExpiry(member.expiryDate);
    if (daysUntilExpiry >= 0 && daysUntilExpiry <= 30) {
      items.push({
        id: `${member.id}-expiry`,
        memberId: member.id,
        trainerName: trainer?.name ?? "-",
        title: "만료 임박",
        message: `${member.name} 회원의 만료일까지 ${daysUntilExpiry}일 남았습니다.`,
      });
    }
    if (member.remainingSessions > 0 && member.remainingSessions <= 3) {
      items.push({
        id: `${member.id}-remaining`,
        memberId: member.id,
        trainerName: trainer?.name ?? "-",
        title: "잔여 횟수 부족",
        message: `${member.name} 회원의 잔여 횟수가 ${member.remainingSessions}회 남았습니다.`,
      });
    }
    const lastCompleted = bookings
      .filter((b) => b.memberId === member.id && b.status === "deducted")
      .sort((a, b) => parseDateTime(b.date, b.time) - parseDateTime(a.date, a.time))[0];
    if (lastCompleted) {
      const daysSince = Math.floor((parseDate(TODAY).getTime() - parseDate(lastCompleted.date).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince >= 14) {
        items.push({
          id: `${member.id}-inactive`,
          memberId: member.id,
          trainerName: trainer?.name ?? "-",
          title: "장기 미이용",
          message: `${member.name} 회원은 마지막 수업 후 ${daysSince}일 동안 이용 기록이 없습니다.`,
        });
      }
    }
    return items;
  });
}

function shell() {
  return {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
    display: "flex",
    justifyContent: "center",
    padding: 20,
    boxSizing: "border-box",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#0f172a",
  };
}

function phoneShell() {
  return {
    width: "100%",
    maxWidth: 460,
    background: "#fff",
    borderRadius: 28,
    border: "1px solid #e2e8f0",
    boxShadow: "0 12px 36px rgba(15,23,42,0.12)",
    overflow: "hidden",
  };
}

function topHeader() {
  return {
    padding: 18,
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(10px)",
    zIndex: 10,
  };
}

function accountChip(active) {
  return {
    border: "none",
    borderRadius: 999,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
    background: active ? "#0f172a" : "#e2e8f0",
    color: active ? "#fff" : "#334155",
    whiteSpace: "nowrap",
  };
}

function sectionCardStyle(extra = {}) {
  return {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 22,
    padding: 16,
    ...extra,
  };
}

function infoBoxStyle(kind = "default") {
  const map = {
    default: { bg: "#f8fafc", border: "#e2e8f0" },
    warning: { bg: "#fffbeb", border: "#fcd34d" },
    danger: { bg: "#fff1f2", border: "#fda4af" },
  };
  return {
    background: map[kind].bg,
    border: `1px solid ${map[kind].border}`,
    borderRadius: 18,
    padding: 14,
    minHeight: 102,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };
}

function textInputStyle() {
  return {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dbe2ea",
    borderRadius: 14,
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
  };
}

function buttonStyle(kind = "primary", full = false) {
  return {
    width: full ? "100%" : "auto",
    borderRadius: 14,
    minHeight: 44,
    padding: "0 14px",
    fontWeight: 800,
    cursor: "pointer",
    border: kind === "secondary" ? "1px solid #cbd5e1" : "none",
    background: kind === "secondary" ? "#fff" : "#0f172a",
    color: kind === "secondary" ? "#334155" : "#fff",
  };
}

function badgeStyle(tone) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${tone.border}`,
    background: tone.bg,
    color: tone.text,
    fontSize: 12,
    fontWeight: 800,
  };
}

function modalOverlay() {
  return {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    zIndex: 30,
  };
}

function modalBox() {
  return {
    width: "100%",
    maxWidth: 400,
    background: "#fff",
    borderRadius: 24,
    border: "1px solid #e2e8f0",
    padding: 18,
    boxSizing: "border-box",
  };
}

function SectionCard({ title, subtitle, children, forwardedRef }) {
  return (
    <div ref={forwardedRef} style={sectionCardStyle()}>
      <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>{title}</h3>
      {subtitle ? <p style={{ marginTop: 4, marginBottom: 0, fontSize: 13, color: "#64748b" }}>{subtitle}</p> : null}
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

function ActionButton({ title, onClick, kind = "primary", full = false }) {
  return (
    <button type="button" onClick={onClick} style={buttonStyle(kind, full)}>{title}</button>
  );
}

function TextField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ marginBottom: 6, fontSize: 13, color: "#475569", fontWeight: 700 }}>{label}</div>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={textInputStyle()} />
    </div>
  );
}

function Pill({ label, tone }) {
  return <span style={badgeStyle(tone)}>{label}</span>;
}

function Modal({ open, children }) {
  if (!open) return null;
  return <div style={modalOverlay()}><div style={modalBox()}>{children}</div></div>;
}

function MemberView({ currentMember, trainerName, bookings, reports, pendingUsages, alertItems, onConfirmDeduction, onCancelBooking, onReserve }) {
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [pendingTime, setPendingTime] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const nextBooking = bookings
    .filter((b) => ["confirmed", "requested"].includes(b.status) && isUpcoming(b.date, b.time))
    .sort((a, b) => parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time))[0];

  const expiryDays = getDaysUntilExpiry(currentMember.expiryDate);
  const expiryTone = expiryDays <= 7 ? "danger" : expiryDays <= 30 ? "warning" : "default";

  const slotAvailable = (time) => {
    const found = bookings.find((b) => b.date === selectedDate && b.time === time && b.status !== "cancelled" && b.status !== "deducted");
    return !found;
  };

  return (
    <div style={{ display: "grid", gap: 14, padding: 16 }}>
      <SectionCard title="내 회원권 정보">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={infoBoxStyle()}><div style={{ fontSize: 13, color: "#64748b" }}>담당 강사</div><div style={{ fontSize: 18, fontWeight: 800 }}>{trainerName}</div></div>
          <div style={infoBoxStyle()}><div style={{ fontSize: 13, color: "#64748b" }}>총 횟수</div><div style={{ fontSize: 18, fontWeight: 800 }}>{currentMember.totalSessions}회</div></div>
          <div style={infoBoxStyle()}><div style={{ fontSize: 13, color: "#64748b" }}>다음 수업일</div><div style={{ fontSize: 18, fontWeight: 800 }}>{nextBooking ? `${formatDateLabel(nextBooking.date)} ${nextBooking.time}` : "없음"}</div></div>
          <div style={infoBoxStyle(pendingUsages.length > 0 ? "warning" : "default")}><div style={{ fontSize: 13, color: "#64748b" }}>미확인 차감</div><div style={{ fontSize: 18, fontWeight: 800 }}>{pendingUsages.length}건</div></div>
          <div style={{ ...infoBoxStyle(expiryTone), gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 13, color: "#64748b" }}>만료일</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{currentMember.expiryDate}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>{expiryDays}일 남음</div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="알림">
        {alertItems.length === 0 ? <div style={{ color: "#64748b" }}>새로운 알림이 없습니다.</div> : alertItems.map((alert) => (
          <div key={alert.id} style={{ ...sectionCardStyle({ background: "#fffbeb", borderColor: "#fcd34d", borderRadius: 16, padding: 14, marginBottom: 10 }) }}>
            <div style={{ fontWeight: 800, color: "#92400e" }}>{alert.title}</div>
            <div style={{ marginTop: 6, color: "#92400e", fontSize: 14 }}>{alert.message}</div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="차감 확인">
        {pendingUsages.length === 0 ? <div style={{ color: "#64748b" }}>확인 대기 중인 수업이 없습니다.</div> : pendingUsages.map((usage) => (
          <div key={usage.id} style={{ ...sectionCardStyle({ borderRadius: 18, padding: 14, marginBottom: 10 }) }}>
            <div style={{ fontWeight: 800 }}>{formatDateLabel(usage.date)} {usage.time}</div>
            <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>강사: {trainerName}</div>
            <div style={{ marginTop: 10 }}><ActionButton title="수업 확인하고 차감 확정" full onClick={() => onConfirmDeduction(usage.id)} /></div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="예약 달력" subtitle="회원은 본인 담당 강사의 빈 시간만 확인할 수 있습니다.">
        <TextField label="날짜" value={selectedDate} onChange={setSelectedDate} type="date" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {TIME_SLOTS.map((time) => {
            const available = slotAvailable(time);
            return (
              <button
                key={time}
                type="button"
                disabled={!available}
                onClick={() => { setPendingTime(time); setConfirmOpen(true); }}
                style={{
                  borderRadius: 16,
                  border: `1px solid ${available ? "#86efac" : "#cbd5e1"}`,
                  background: available ? "#ecfdf5" : "#f1f5f9",
                  padding: 12,
                  cursor: available ? "pointer" : "not-allowed",
                  opacity: available ? 1 : 0.75,
                }}
              >
                <div style={{ fontWeight: 800, color: available ? "#065f46" : "#64748b" }}>{time}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: available ? "#047857" : "#64748b" }}>{available ? "예약 가능" : "예약 불가"}</div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="내 예약 관리">
        {bookings.length === 0 ? <div style={{ color: "#64748b" }}>예약된 수업이 없습니다.</div> : bookings.map((booking) => (
          <div key={booking.id} style={{ ...sectionCardStyle({ borderRadius: 18, padding: 14, marginBottom: 10 }) }}>
            <div style={{ fontWeight: 800 }}>{formatDateLabel(booking.date)} {booking.time}</div>
            <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>강사: {trainerName}</div>
            <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>상태: {getBookingStatusLabel(booking.status)}</div>
            <div style={{ marginTop: 10 }}>
              {canCancel(booking.date, booking.time) ? (
                <ActionButton title="예약 취소" kind="secondary" full onClick={() => onCancelBooking(booking.id)} />
              ) : (
                <div style={{ ...sectionCardStyle({ background: "#fff1f2", borderColor: "#fda4af", borderRadius: 16, padding: 14 }) }}>
                  <div style={{ color: "#be123c", fontSize: 14 }}>수업 48시간 이내라 센터 문의가 필요합니다.</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="리포트 / 알림">
        {reports.length === 0 ? <div style={{ color: "#64748b" }}>리포트가 없습니다.</div> : reports.map((report) => (
          <div key={report.id} style={{ ...sectionCardStyle({ background: "#f8fafc", borderRadius: 16, padding: 14, marginBottom: 10 }) }}>
            <div style={{ fontWeight: 700 }}>{report.message}</div>
            <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>{report.createdAt}</div>
          </div>
        ))}
      </SectionCard>

      <Modal open={confirmOpen}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>예약 확인</h3>
        <p style={{ marginTop: 4, color: "#64748b", fontSize: 13 }}>선택한 날짜와 시간으로 예약을 진행할까요?</p>
        <div style={{ ...sectionCardStyle({ background: "#f8fafc", borderRadius: 16, padding: 14, marginTop: 10, marginBottom: 14 }) }}>
          <div style={{ color: "#334155", fontSize: 14 }}>담당 강사: {trainerName}</div>
          <div style={{ color: "#334155", fontSize: 14, marginTop: 4 }}>날짜: {selectedDate}</div>
          <div style={{ color: "#334155", fontSize: 14, marginTop: 4 }}>시간: {pendingTime}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <ActionButton title="닫기" kind="secondary" onClick={() => { setConfirmOpen(false); setPendingTime(""); }} />
          <ActionButton title="예약하기" onClick={() => {
            onReserve(selectedDate, pendingTime);
            setConfirmOpen(false);
            setPendingTime("");
          }} />
        </div>
      </Modal>
    </div>
  );
}

function TrainerView({ trainer, members, bookings, alerts, onCreateTrainerBooking, onTrainerCancelBooking, onCompleteClass, onAddMember }) {
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || "");
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberSessions, setMemberSessions] = useState("8");
  const [firstLessonDate, setFirstLessonDate] = useState(TODAY);
  const [weekStart, setWeekStart] = useState(getStartOfWeekSunday(selectedDate));

  const activeMembers = members.filter((m) => getMemberStatus(m) === "active");
  const availableMemberId = selectedMemberId || activeMembers[0]?.id || "";
  const dayBookings = bookings.filter((b) => b.date === selectedDate && b.status !== "cancelled");
  const weekDays = makeDateRange(weekStart, 7);

  const slotBooking = (time) => dayBookings.find((b) => b.time === time);

  return (
    <div style={{ display: "grid", gap: 14, padding: 16 }}>
      <SectionCard title="강사 일일 달력" subtitle={`${trainer.name} · 직접 예약 추가/취소/수업 완료 처리가 가능합니다.`}>
        <TextField label="날짜" value={selectedDate} onChange={(value) => { setSelectedDate(value); setWeekStart(getStartOfWeekSunday(value)); }} type="date" />
        {TIME_SLOTS.map((time) => {
          const booking = slotBooking(time);
          return (
            <div key={time} style={{ ...sectionCardStyle({ borderRadius: 18, padding: 14, marginBottom: 10 }) }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{time}</div>
                  {booking ? (
                    <>
                      <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>회원: {members.find((m) => m.id === booking.memberId)?.name || "-"}</div>
                      <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>상태: {getBookingStatusLabel(booking.status)}</div>
                    </>
                  ) : <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>비어 있음</div>}
                </div>
                {booking ? (
                  <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                    <Pill label={getBookingStatusLabel(booking.status)} tone={getTone(booking.status)} />
                    {(booking.status === "confirmed" || booking.status === "requested") && <ActionButton title="수업 완료 처리" onClick={() => onCompleteClass(booking.id)} />}
                    {(booking.status === "confirmed" || booking.status === "requested") && <ActionButton title="예약 취소" kind="secondary" onClick={() => {
                      setConfirmAction({ type: "cancel", payload: { booking } });
                      setConfirmOpen(true);
                    }} />}
                  </div>
                ) : <ActionButton title="예약 추가" kind="secondary" onClick={() => { setSelectedTime(time); setSelectedMemberId(activeMembers[0]?.id || ""); setCreateOpen(true); }} />}
              </div>
            </div>
          );
        })}
      </SectionCard>

      <SectionCard title="주간 캘린더" subtitle="일요일부터 토요일 기준으로 1주 단위 확인">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
          <ActionButton title="◀" kind="secondary" onClick={() => setWeekStart(addDays(weekStart, -7))} />
          <ActionButton title="오늘" onClick={() => setWeekStart(getStartOfWeekSunday(TODAY))} />
          <ActionButton title="▶" kind="secondary" onClick={() => setWeekStart(addDays(weekStart, 7))} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {["일","월","화","수","목","금","토"].map((d) => <div key={d} style={{ textAlign: "center", fontSize: 12, color: "#64748b", fontWeight: 700 }}>{d}</div>)}
          {weekDays.map((day) => {
            const entries = bookings.filter((b) => b.date === day && b.status !== "cancelled").sort((a, b) => a.time.localeCompare(b.time));
            return (
              <div key={day} style={{ border: day === TODAY ? "2px solid #3b82f6" : "1px solid #e2e8f0", background: entries.length ? "#fff" : "#f8fafc", borderRadius: 16, padding: 8, minHeight: 150, boxSizing: "border-box" }}>
                <div style={{ textAlign: "center", fontWeight: 800, fontSize: 12 }}>{formatDateLabel(day)}</div>
                <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
                  {entries.length === 0 ? <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center" }}>예약 없음</div> : entries.slice(0,3).map((entry) => (
                    <div key={entry.id} style={{ background: getTone(entry.status).bg, border: `1px solid ${getTone(entry.status).border}`, borderRadius: 10, padding: 6, fontSize: 11 }}>
                      <div style={{ fontWeight: 800 }}>{entry.time}</div>
                      <div style={{ marginTop: 2 }}>{members.find((m) => m.id === entry.memberId)?.name || "-"}</div>
                    </div>
                  ))}
                  {entries.length > 3 ? <div style={{ fontSize: 11, textAlign: "center", color: "#64748b" }}>+{entries.length - 3}건 더 있음</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="회원 목록">
        <div style={{ marginBottom: 12 }}><ActionButton title="회원 등록" full onClick={() => setMemberModalOpen(true)} /></div>
        {members.map((member) => {
          const tone = getMemberStatusTone(member);
          return (
            <div key={member.id} style={{ ...sectionCardStyle({ borderRadius: 18, padding: 14, marginBottom: 10 }) }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>{member.name}</div>
                  <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>{member.phone}</div>
                  <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>총 {member.totalSessions}회 · 남은 {member.remainingSessions}회 · 만료 {member.expiryDate}</div>
                </div>
                <Pill label={getMemberStatusLabel(member)} tone={tone} />
              </div>
            </div>
          );
        })}
      </SectionCard>

      <SectionCard title="회원 알림">
        {alerts.length === 0 ? <div style={{ color: "#64748b" }}>확인할 알림이 없습니다.</div> : alerts.map((alert) => (
          <div key={alert.id} style={{ ...sectionCardStyle({ background: "#fffbeb", borderColor: "#fcd34d", borderRadius: 16, padding: 14, marginBottom: 10 }) }}>
            <div style={{ fontWeight: 800, color: "#92400e" }}>{alert.title}</div>
            <div style={{ marginTop: 6, color: "#92400e", fontSize: 14 }}>{alert.message}</div>
          </div>
        ))}
      </SectionCard>

      <Modal open={createOpen}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>강사 직접 예약 추가</h3>
        <p style={{ marginTop: 4, color: "#64748b", fontSize: 13 }}>선택한 시간에 담당 회원을 배정합니다.</p>
        <div style={{ ...sectionCardStyle({ background: "#f8fafc", borderRadius: 16, padding: 14, marginTop: 10, marginBottom: 12 }) }}>
          <div style={{ color: "#334155", fontSize: 14 }}>강사: {trainer.name}</div>
          <div style={{ color: "#334155", fontSize: 14, marginTop: 4 }}>날짜: {selectedDate}</div>
          <div style={{ color: "#334155", fontSize: 14, marginTop: 4 }}>시간: {selectedTime}</div>
        </div>
        <TextField label="회원 ID" value={availableMemberId} onChange={setSelectedMemberId} placeholder="예: m1" />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <ActionButton title="닫기" kind="secondary" onClick={() => setCreateOpen(false)} />
          <ActionButton title="예약 등록" onClick={() => {
            if (!availableMemberId) {
              window.alert("회원 ID를 입력해 주세요.");
              return;
            }
            setConfirmAction({ type: "create", payload: { trainerId: trainer.id, memberId: availableMemberId, date: selectedDate, time: selectedTime } });
            setConfirmOpen(true);
          }} />
        </div>
      </Modal>

      <Modal open={confirmOpen}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{confirmAction?.type === "cancel" ? "예약 취소 확인" : "예약 등록 확인"}</h3>
        <p style={{ marginTop: 4, color: "#64748b", fontSize: 13 }}>{confirmAction?.type === "cancel" ? "해당 예약을 취소할까요?" : "선택한 시간에 예약을 등록할까요?"}</p>
        <div style={{ ...sectionCardStyle({ background: "#f8fafc", borderRadius: 16, padding: 14, marginTop: 10, marginBottom: 12 }) }}>
          {confirmAction?.type === "cancel" ? (
            <div style={{ color: "#334155", fontSize: 14 }}>{confirmAction?.payload?.booking ? `${formatDateLabel(confirmAction.payload.booking.date)} ${confirmAction.payload.booking.time}` : ""}</div>
          ) : (
            <>
              <div style={{ color: "#334155", fontSize: 14 }}>강사: {trainer.name}</div>
              <div style={{ color: "#334155", fontSize: 14, marginTop: 4 }}>날짜: {selectedDate}</div>
              <div style={{ color: "#334155", fontSize: 14, marginTop: 4 }}>시간: {selectedTime}</div>
              <div style={{ color: "#334155", fontSize: 14, marginTop: 4 }}>회원 ID: {availableMemberId}</div>
            </>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <ActionButton title="닫기" kind="secondary" onClick={() => { setConfirmOpen(false); setConfirmAction(null); }} />
          <ActionButton title="확인" onClick={() => {
            if (confirmAction?.type === "cancel") onTrainerCancelBooking(confirmAction.payload.booking.id);
            if (confirmAction?.type === "create") onCreateTrainerBooking(confirmAction.payload);
            setConfirmOpen(false);
            setConfirmAction(null);
            setCreateOpen(false);
          }} />
        </div>
      </Modal>

      <Modal open={memberModalOpen}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>회원 등록</h3>
        <TextField label="회원 이름" value={memberName} onChange={setMemberName} placeholder="이름" />
        <TextField label="연락처" value={memberPhone} onChange={(v) => setMemberPhone(formatPhone(v))} placeholder="010-0000-0000" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
          {[8,22,57].map((n) => <ActionButton key={n} title={`${n}회`} kind="secondary" onClick={() => setMemberSessions(String(n))} />)}
        </div>
        <TextField label="횟수권" value={memberSessions} onChange={setMemberSessions} type="number" />
        <TextField label="첫 수업일" value={firstLessonDate} onChange={setFirstLessonDate} type="date" />
        <div style={{ ...sectionCardStyle({ background: "#f8fafc", borderRadius: 16, padding: 14, marginBottom: 12 }) }}>
          <div style={{ color: "#334155", fontSize: 14 }}>예상 만료일: {addOneYear(firstLessonDate || TODAY)}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <ActionButton title="닫기" kind="secondary" onClick={() => setMemberModalOpen(false)} />
          <ActionButton title="저장" onClick={() => {
            const total = Number(memberSessions);
            const digits = memberPhone.replace(/[^0-9]/g, "");
            if (!memberName.trim()) return window.alert("회원 이름을 입력해 주세요.");
            if (digits.length < 10 || digits.length > 11) return window.alert("올바른 연락처를 입력해 주세요.");
            if (!Number.isInteger(total) || total < 1 || total > 57) return window.alert("횟수권은 1회부터 57회까지 입력해 주세요.");
            if (!firstLessonDate) return window.alert("첫 수업일을 입력해 주세요.");
            onAddMember({
              name: memberName.trim(),
              phone: memberPhone,
              trainerId: trainer.id,
              totalSessions: total,
              firstLessonDate,
              expiryDate: addOneYear(firstLessonDate),
            });
            setMemberModalOpen(false);
            setMemberName("");
            setMemberPhone("");
            setMemberSessions("8");
            setFirstLessonDate(TODAY);
          }} />
        </div>
      </Modal>
    </div>
  );
}

function AdminView({ trainers, members, bookings, alerts, deletedBookings, onAdminDeleteBooking }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [expandedTrainerId, setExpandedTrainerId] = useState(null);
  const [trainerModalOpen, setTrainerModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [trainerName, setTrainerName] = useState("");
  const [trainerPhone, setTrainerPhone] = useState("");
  const [trainerSpecialty, setTrainerSpecialty] = useState("");
  const allMembersRef = useRef(null);
  const todayBookingsRef = useRef(null);
  const awaitingRef = useRef(null);
  const attentionRef = useRef(null);

  const bookingSummary = {
    requested: bookings.filter((b) => b.status === "requested").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    awaiting: bookings.filter((b) => b.status === "awaiting_member_confirmation").length,
    deducted: bookings.filter((b) => b.status === "deducted").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const expiringSoon = members.filter((m) => getMemberStatus(m) === "active" && (m.remainingSessions <= 5 || getDaysUntilExpiry(m.expiryDate) <= 30));
  const expiredMembers = members.filter((m) => getMemberStatus(m) === "expired");
  const completedMembers = members.filter((m) => getMemberStatus(m) === "completed");

  const summaryCards = [
    { title: "전체 회원", value: `${members.length}명`, onClick: () => allMembersRef.current?.scrollIntoView({ behavior: "smooth" }) },
    { title: "오늘 예약", value: `${bookings.filter((b) => b.date === TODAY && b.status !== "cancelled").length}건`, onClick: () => todayBookingsRef.current?.scrollIntoView({ behavior: "smooth" }) },
    { title: "차감 대기", value: `${bookings.filter((b) => b.status === "awaiting_member_confirmation").length}건`, onClick: () => awaitingRef.current?.scrollIntoView({ behavior: "smooth" }) },
    { title: "주의 회원", value: `${expiringSoon.length}명`, onClick: () => attentionRef.current?.scrollIntoView({ behavior: "smooth" }) },
  ];

  const openTrainerAdd = () => {
    setEditingTrainer(null);
    setTrainerName("");
    setTrainerPhone("");
    setTrainerSpecialty("");
    setTrainerModalOpen(true);
  };

  const openTrainerEdit = (trainer) => {
    setEditingTrainer(trainer);
    setTrainerName(trainer.name);
    setTrainerPhone(trainer.phone);
    setTrainerSpecialty(trainer.specialty);
    setTrainerModalOpen(true);
  };

  return (
    <div style={{ display: "grid", gap: 14, padding: 16 }}>
      <SectionCard title="관리자 요약">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {summaryCards.map((card) => (
            <button key={card.title} type="button" onClick={card.onClick} style={{ ...infoBoxStyle(), cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontSize: 13, color: "#64748b" }}>{card.title}</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{card.value}</div>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="예약 상태 요약">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={infoBoxStyle()}><div style={{ fontSize: 13, color: "#64748b" }}>예약 요청</div><div style={{ fontSize: 20, fontWeight: 800, color: "#6d28d9" }}>{bookingSummary.requested}건</div></div>
          <div style={infoBoxStyle()}><div style={{ fontSize: 13, color: "#64748b" }}>예약 확정</div><div style={{ fontSize: 20, fontWeight: 800, color: "#2563eb" }}>{bookingSummary.confirmed}건</div></div>
          <div style={infoBoxStyle("warning")}><div style={{ fontSize: 13, color: "#64748b" }}>회원 확인 대기</div><div style={{ fontSize: 20, fontWeight: 800, color: "#b45309" }}>{bookingSummary.awaiting}건</div></div>
          <div style={infoBoxStyle()}><div style={{ fontSize: 13, color: "#64748b" }}>차감 완료</div><div style={{ fontSize: 20, fontWeight: 800, color: "#059669" }}>{bookingSummary.deducted}건</div></div>
        </div>
      </SectionCard>

      <SectionCard title="강사별 회원 현황" subtitle="강사 정보 수정과 회원 현황을 함께 관리합니다." forwardedRef={allMembersRef}>
        <div style={{ marginBottom: 12 }}><ActionButton title="강사 추가" full onClick={openTrainerAdd} /></div>
        {trainers.map((trainer) => {
          const trainerMembers = members.filter((m) => m.trainerId === trainer.id);
          const expanded = expandedTrainerId === trainer.id;
          return (
            <div key={trainer.id} style={{ ...sectionCardStyle({ borderRadius: 18, padding: 14, marginBottom: 10 }) }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <button type="button" onClick={() => setExpandedTrainerId(expanded ? null : trainer.id)} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0, textAlign: "left", flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>{trainer.name}</div>
                  <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>회원 수 {trainerMembers.length}명</div>
                  <div style={{ marginTop: 4, color: "#64748b", fontSize: 12 }}>{trainer.phone} · {trainer.specialty}</div>
                </button>
                <div style={{ display: "grid", gap: 8 }}>
                  <ActionButton title="정보 수정" kind="secondary" onClick={() => openTrainerEdit(trainer)} />
                  <ActionButton title={expanded ? "접기" : "열기"} kind="secondary" onClick={() => setExpandedTrainerId(expanded ? null : trainer.id)} />
                </div>
              </div>
              {expanded ? (
                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "0.9fr 0.9fr 1.2fr 1fr 1fr 0.8fr 0.8fr", gap: 8, fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                    <div>상태</div><div>성명</div><div>연락처</div><div>최초수업일</div><div>마지막수업일</div><div>사용횟수</div><div>잔여횟수</div>
                  </div>
                  {trainerMembers.length === 0 ? <div style={{ color: "#64748b", fontSize: 14 }}>등록된 회원이 없습니다.</div> : trainerMembers.map((member) => {
                    const tone = getMemberStatusTone(member);
                    return (
                      <div key={member.id} style={{ display: "grid", gridTemplateColumns: "0.9fr 0.9fr 1.2fr 1fr 1fr 0.8fr 0.8fr", gap: 8, fontSize: 12, alignItems: "center" }}>
                        <div><span style={badgeStyle(tone)}>{getMemberStatusLabel(member)}</span></div>
                        <div>{member.name}</div>
                        <div>{member.phone}</div>
                        <div>{member.firstLessonDate}</div>
                        <div>{getLastLessonDate(member.id, bookings)}</div>
                        <div>{getUsedSessions(member)}회</div>
                        <div>{member.remainingSessions}회</div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </SectionCard>

      <SectionCard title="차감 대기 목록" forwardedRef={awaitingRef}>
        {bookings.filter((b) => b.status === "awaiting_member_confirmation").length === 0 ? <div style={{ color: "#64748b" }}>차감 대기 예약이 없습니다.</div> : bookings.filter((b) => b.status === "awaiting_member_confirmation").map((booking) => {
          const member = members.find((m) => m.id === booking.memberId);
          const trainer = trainers.find((t) => t.id === booking.trainerId);
          return (
            <div key={booking.id} style={{ ...sectionCardStyle({ background: "#fffbeb", borderColor: "#fcd34d", borderRadius: 16, padding: 14, marginBottom: 10 }) }}>
              <div style={{ fontWeight: 800, color: "#92400e" }}>{formatDateLabel(booking.date)} {booking.time}</div>
              <div style={{ marginTop: 4, color: "#92400e", fontSize: 14 }}>회원: {member?.name || "-"}</div>
              <div style={{ marginTop: 4, color: "#92400e", fontSize: 14 }}>강사: {trainer?.name || "-"}</div>
            </div>
          );
        })}
      </SectionCard>

      <SectionCard title="자동 알림">
        {alerts.length === 0 ? <div style={{ color: "#64748b" }}>현재 자동 알림 대상이 없습니다.</div> : alerts.map((alert) => (
          <div key={alert.id} style={{ ...sectionCardStyle({ background: "#fffbeb", borderColor: "#fcd34d", borderRadius: 16, padding: 14, marginBottom: 10 }) }}>
            <div style={{ fontWeight: 800, color: "#92400e" }}>{alert.title}</div>
            <div style={{ marginTop: 6, color: "#92400e", fontSize: 14 }}>{alert.message}</div>
            <div style={{ marginTop: 6, color: "#92400e", fontSize: 12 }}>담당 강사: {alert.trainerName}</div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="오늘 예약 / 최근 예약" forwardedRef={todayBookingsRef}>
        {bookings.slice().sort((a,b) => parseDateTime(b.date,b.time) - parseDateTime(a.date,a.time)).map((booking) => {
          const member = members.find((m) => m.id === booking.memberId);
          const trainer = trainers.find((t) => t.id === booking.trainerId);
          return (
            <div key={booking.id} style={{ ...sectionCardStyle({ borderRadius: 18, padding: 14, marginBottom: 10 }) }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{formatDateLabel(booking.date)} {booking.time}</div>
                  <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>강사: {trainer?.name || "-"}</div>
                  <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>회원: {member?.name || "-"}</div>
                  <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>상태: {getBookingStatusLabel(booking.status)}</div>
                </div>
                <ActionButton title="수업 삭제" kind="secondary" onClick={() => { setDeleteTarget(booking); setDeleteOpen(true); }} />
              </div>
            </div>
          );
        })}
      </SectionCard>

      <SectionCard title="예약 삭제 이력">
        {deletedBookings.length === 0 ? <div style={{ color: "#64748b" }}>삭제 이력이 없습니다.</div> : deletedBookings.map((deleted) => (
          <div key={deleted.id} style={{ ...sectionCardStyle({ background: "#f8fafc", borderRadius: 16, padding: 14, marginBottom: 10 }) }}>
            <div style={{ fontWeight: 800 }}>{formatDateLabel(deleted.date)} {deleted.time}</div>
            <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>강사: {deleted.trainerName}</div>
            <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>회원: {deleted.memberName}</div>
            <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>이전 상태: {getBookingStatusLabel(deleted.previousStatus)}</div>
            <div style={{ marginTop: 4, color: "#334155", fontSize: 14 }}>삭제 사유: {deleted.reason}</div>
            <div style={{ marginTop: 4, color: "#94a3b8", fontSize: 12 }}>삭제 시각: {deleted.deletedAt}</div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="만료 회원">
        {expiredMembers.length === 0 ? <div style={{ color: "#64748b" }}>만료된 회원이 없습니다.</div> : expiredMembers.map((member) => (
          <div key={member.id} style={{ ...sectionCardStyle({ background: "#fff1f2", borderColor: "#fda4af", borderRadius: 16, padding: 14, marginBottom: 10 }) }}>
            <div style={{ fontWeight: 800, color: "#be123c" }}>{member.name}</div>
            <div style={{ marginTop: 4, color: "#be123c", fontSize: 14 }}>만료일: {member.expiryDate}</div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="사용완료 회원">
        {completedMembers.length === 0 ? <div style={{ color: "#64748b" }}>사용완료된 회원이 없습니다.</div> : completedMembers.map((member) => (
          <div key={member.id} style={{ ...sectionCardStyle({ background: "#fffbeb", borderColor: "#fcd34d", borderRadius: 16, padding: 14, marginBottom: 10 }) }}>
            <div style={{ fontWeight: 800, color: "#b45309" }}>{member.name}</div>
            <div style={{ marginTop: 4, color: "#b45309", fontSize: 14 }}>잔여 횟수: {member.remainingSessions}회</div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="만료 / 소진 주의" forwardedRef={attentionRef}>
        {expiringSoon.length === 0 ? <div style={{ color: "#64748b" }}>주의 대상 회원이 없습니다.</div> : expiringSoon.map((member) => (
          <div key={member.id} style={{ ...sectionCardStyle({ background: "#fffbeb", borderColor: "#fcd34d", borderRadius: 16, padding: 14, marginBottom: 10 }) }}>
            <div style={{ fontWeight: 800, color: "#92400e" }}>{member.name}</div>
            <div style={{ marginTop: 4, color: "#92400e", fontSize: 14 }}>남은 횟수: {member.remainingSessions}회</div>
            <div style={{ marginTop: 4, color: "#92400e", fontSize: 14 }}>만료일: {member.expiryDate}</div>
          </div>
        ))}
      </SectionCard>

      <Modal open={deleteOpen}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>수업 삭제 확인</h3>
        <p style={{ marginTop: 4, color: "#64748b", fontSize: 13 }}>삭제 사유를 입력해야 수업을 삭제할 수 있습니다.</p>
        <div style={{ ...sectionCardStyle({ background: "#f8fafc", borderRadius: 16, padding: 14, marginTop: 10, marginBottom: 12 }) }}>
          <div style={{ color: "#334155", fontSize: 14 }}>{deleteTarget ? `${formatDateLabel(deleteTarget.date)} ${deleteTarget.time}` : ""}</div>
        </div>
        <TextField label="삭제 사유" value={deleteReason} onChange={setDeleteReason} placeholder="예: 강사 입력 실수" />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <ActionButton title="닫기" kind="secondary" onClick={() => { setDeleteOpen(false); setDeleteReason(""); setDeleteTarget(null); }} />
          <ActionButton title="삭제하기" onClick={() => {
            if (!deleteReason.trim()) return window.alert("삭제 사유를 입력해 주세요.");
            onAdminDeleteBooking(deleteTarget.id, deleteReason.trim());
            setDeleteOpen(false);
            setDeleteReason("");
            setDeleteTarget(null);
          }} />
        </div>
      </Modal>

      <Modal open={trainerModalOpen}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{editingTrainer ? "강사 정보 수정" : "강사 추가"}</h3>
        <TextField label="강사 이름" value={trainerName} onChange={setTrainerName} placeholder="이름" />
        <TextField label="연락처" value={trainerPhone} onChange={(v) => setTrainerPhone(formatPhone(v))} placeholder="010-0000-0000" />
        <TextField label="전문분야" value={trainerSpecialty} onChange={setTrainerSpecialty} placeholder="예: 체형교정" />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <ActionButton title="닫기" kind="secondary" onClick={() => setTrainerModalOpen(false)} />
          <ActionButton title="저장" onClick={() => {
            if (!trainerName.trim()) return window.alert("강사 이름을 입력해 주세요.");
            const digits = trainerPhone.replace(/[^0-9]/g, "");
            if (digits.length < 10 || digits.length > 11) return window.alert("올바른 연락처를 입력해 주세요.");
            // This preview keeps UI-only editing flow.
            window.alert("미리보기 버전에서는 강사 저장 UI만 확인합니다.");
            setTrainerModalOpen(false);
          }} />
        </div>
      </Modal>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(DEMO_ACCOUNTS[0]);
  const [trainers] = useState(INITIAL_TRAINERS);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [deletedBookings, setDeletedBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const role = currentUser.role;
  const currentMember = members.find((m) => m.id === currentUser.memberId) || members[0];
  const currentTrainer = trainers.find((t) => t.id === currentUser.trainerId) || trainers[0];
  const alertItems = useMemo(() => getAlertItems(members, trainers, bookings), [members, trainers, bookings]);

  const memberBookings = bookings.filter((b) => b.memberId === currentMember.id && b.status !== "cancelled" && b.status !== "deducted");
  const pendingUsages = bookings.filter((b) => b.memberId === currentMember.id && b.status === "awaiting_member_confirmation");
  const trainerMembers = members.filter((m) => m.trainerId === currentTrainer.id);
  const trainerAlerts = alertItems.filter((a) => members.find((m) => m.id === a.memberId)?.trainerId === currentTrainer.id);

  const searchNormalized = searchQuery.trim().toLowerCase();
  const compactSearch = searchNormalized.replace(/[^0-9a-z가-힣]/g, "");
  const memberResults = searchNormalized ? members.filter((m) => m.name.toLowerCase().includes(searchNormalized) || m.phone.replace(/[^0-9]/g, "").includes(compactSearch)) : [];
  const trainerResults = searchNormalized ? trainers.filter((t) => t.name.toLowerCase().includes(searchNormalized) || t.phone.replace(/[^0-9]/g, "").includes(compactSearch) || t.specialty.toLowerCase().includes(searchNormalized)) : [];
  const bookingResults = searchNormalized ? bookings.filter((b) => {
    const member = members.find((m) => m.id === b.memberId);
    const trainer = trainers.find((t) => t.id === b.trainerId);
    const hay = `${b.date} ${b.time} ${member?.name || ""} ${trainer?.name || ""} ${b.status}`.toLowerCase();
    const compact = `${b.date.replace(/-/g, "")} ${b.time.replace(/:/g, "")} ${(member?.phone || "").replace(/[^0-9]/g, "")}`;
    return hay.includes(searchNormalized) || compact.includes(compactSearch);
  }) : [];

  const reserveSlot = (date, time) => {
    if (date < TODAY || date > addDays(TODAY, 21)) return window.alert("예약 가능 기간은 오늘부터 3주 이내입니다.");
    const exists = bookings.some((b) => b.trainerId === currentMember.trainerId && b.date === date && b.time === time && b.status !== "cancelled");
    if (exists) return window.alert("이미 예약된 시간입니다.");
    setBookings((prev) => [...prev, { id: `b${Date.now()}`, trainerId: currentMember.trainerId, memberId: currentMember.id, date, time, status: "requested" }]);
    setReports((prev) => [{ id: `r${Date.now()}`, memberId: currentMember.id, message: `${formatDateLabel(date)} ${time} 예약 요청이 접수되었습니다.`, createdAt: `${TODAY} 10:00` }, ...prev]);
  };

  const cancelBooking = (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    if (!canCancel(booking.date, booking.time)) return window.alert("수업 48시간 이내라 센터 문의가 필요합니다.");
    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b));
    setReports((prev) => [{ id: `r${Date.now()}`, memberId: booking.memberId, message: `${formatDateLabel(booking.date)} ${booking.time} 예약이 정상적으로 취소되었습니다.`, createdAt: `${TODAY} 10:20` }, ...prev]);
  };

  const completeClass = (bookingId) => {
    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "awaiting_member_confirmation" } : b));
  };

  const confirmDeduction = (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "deducted" } : b));
    setMembers((prev) => prev.map((m) => m.id === booking.memberId ? { ...m, remainingSessions: Math.max(0, m.remainingSessions - 1) } : m));
    setReports((prev) => [{ id: `r${Date.now()}`, memberId: booking.memberId, message: `${formatDateLabel(booking.date)} ${booking.time} 수업이 확인되어 1회 차감되었습니다.`, createdAt: `${TODAY} 11:00` }, ...prev]);
  };

  const createTrainerBooking = ({ trainerId, memberId, date, time }) => {
    const exists = bookings.some((b) => b.trainerId === trainerId && b.date === date && b.time === time && b.status !== "cancelled");
    if (exists) return window.alert("이미 예약된 시간입니다.");
    setBookings((prev) => [...prev, { id: `b${Date.now()}`, trainerId, memberId, date, time, status: "confirmed" }]);
    setReports((prev) => [{ id: `r${Date.now()}`, memberId, message: `${formatDateLabel(date)} ${time} 수업이 강사에 의해 예약되었습니다.`, createdAt: `${TODAY} 11:10` }, ...prev]);
  };

  const trainerCancelBooking = (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || booking.status === "deducted") return;
    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b));
    setReports((prev) => [{ id: `r${Date.now()}`, memberId: booking.memberId, message: `${formatDateLabel(booking.date)} ${booking.time} 예약이 강사에 의해 취소되었습니다.`, createdAt: `${TODAY} 11:20` }, ...prev]);
  };

  const addMember = ({ name, phone, trainerId, totalSessions, firstLessonDate, expiryDate }) => {
    setMembers((prev) => [...prev, {
      id: `m${Date.now()}`,
      name,
      phone,
      trainerId,
      totalSessions,
      remainingSessions: totalSessions,
      firstLessonDate,
      expiryDate,
    }]);
  };

  const adminDeleteBooking = (bookingId, reason) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    const member = members.find((m) => m.id === booking.memberId);
    const trainer = trainers.find((t) => t.id === booking.trainerId);
    if (booking.status === "deducted") {
      setMembers((prev) => prev.map((m) => m.id === booking.memberId ? { ...m, remainingSessions: Math.min(m.totalSessions, m.remainingSessions + 1) } : m));
    }
    setDeletedBookings((prev) => [{
      id: `db${Date.now()}`,
      bookingId: booking.id,
      date: booking.date,
      time: booking.time,
      trainerName: trainer?.name || "-",
      memberName: member?.name || "-",
      previousStatus: booking.status,
      reason,
      deletedAt: `${TODAY} 12:00`,
    }, ...prev]);
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    setReports((prev) => [{ id: `r${Date.now()}`, memberId: booking.memberId, message: `${formatDateLabel(booking.date)} ${booking.time} 수업이 관리자에 의해 삭제되었습니다. 사유: ${reason}.${booking.status === "deducted" ? " 차감 횟수는 복구되었습니다." : ""}`, createdAt: `${TODAY} 12:00` }, ...prev]);
  };

  return (
    <div style={shell()}>
      <div style={phoneShell()}>
        <div style={topHeader()}>
          <div style={{ fontSize: 28, fontWeight: 900 }}>본앤밸런스</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>휴대폰 테스트용 단일 파일 앱</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 12 }}>
            {DEMO_ACCOUNTS.map((account) => (
              <button key={account.id} type="button" onClick={() => setCurrentUser(account)} style={accountChip(currentUser.id === account.id)}>{account.label}</button>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <TextField label="검색" value={searchQuery} onChange={setSearchQuery} placeholder="회원, 강사, 예약 검색" />
            {searchNormalized ? (
              <div style={{ display: "grid", gap: 10 }}>
                <div style={sectionCardStyle({ background: "#f8fafc", borderRadius: 16, padding: 14 })}>
                  <div style={{ fontWeight: 800 }}>회원 ({memberResults.length})</div>
                  {memberResults.length === 0 ? <div style={{ marginTop: 6, color: "#64748b" }}>일치하는 회원이 없습니다.</div> : memberResults.slice(0, 4).map((m) => <div key={m.id} style={{ marginTop: 6, fontSize: 14 }}>{m.name} · {m.phone}</div>)}
                </div>
                <div style={sectionCardStyle({ background: "#f8fafc", borderRadius: 16, padding: 14 })}>
                  <div style={{ fontWeight: 800 }}>강사 ({trainerResults.length})</div>
                  {trainerResults.length === 0 ? <div style={{ marginTop: 6, color: "#64748b" }}>일치하는 강사가 없습니다.</div> : trainerResults.slice(0, 4).map((t) => <div key={t.id} style={{ marginTop: 6, fontSize: 14 }}>{t.name} · {t.specialty}</div>)}
                </div>
                <div style={sectionCardStyle({ background: "#f8fafc", borderRadius: 16, padding: 14 })}>
                  <div style={{ fontWeight: 800 }}>예약 ({bookingResults.length})</div>
                  {bookingResults.length === 0 ? <div style={{ marginTop: 6, color: "#64748b" }}>일치하는 예약이 없습니다.</div> : bookingResults.slice(0, 4).map((b) => <div key={b.id} style={{ marginTop: 6, fontSize: 14 }}>{formatDateLabel(b.date)} {b.time} · {getBookingStatusLabel(b.status)}</div>)}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {role === "member" ? (
          <MemberView
            currentMember={currentMember}
            trainerName={trainers.find((t) => t.id === currentMember.trainerId)?.name || "-"}
            bookings={memberBookings}
            reports={reports.filter((r) => r.memberId === currentMember.id)}
            pendingUsages={pendingUsages}
            alertItems={alertItems.filter((a) => a.memberId === currentMember.id)}
            onConfirmDeduction={confirmDeduction}
            onCancelBooking={cancelBooking}
            onReserve={reserveSlot}
          />
        ) : null}

        {role === "trainer" ? (
          <TrainerView
            trainer={currentTrainer}
            members={trainerMembers}
            bookings={bookings.filter((b) => b.trainerId === currentTrainer.id)}
            alerts={trainerAlerts}
            onCreateTrainerBooking={createTrainerBooking}
            onTrainerCancelBooking={trainerCancelBooking}
            onCompleteClass={completeClass}
            onAddMember={addMember}
          />
        ) : null}

        {role === "admin" ? (
          <AdminView
            trainers={trainers}
            members={members}
            bookings={bookings}
            alerts={alertItems}
            deletedBookings={deletedBookings}
            onAdminDeleteBooking={adminDeleteBooking}
          />
        ) : null}
      </div>
    </div>
  );
}
