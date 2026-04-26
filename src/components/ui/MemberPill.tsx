import React from 'react';
import type { HouseholdMember } from '../../types';

interface MemberPillProps {
  member: HouseholdMember;
  role?: string;
  size?: 'sm' | 'md';
}

export function MemberPill({ member, role, size = 'sm' }: MemberPillProps) {
  const sm = size === 'sm';
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full"
      style={{
        background: member.color + '18',
        border: `1.5px solid ${member.color}30`,
        padding: sm ? '2px 8px 2px 4px' : '3px 10px 3px 5px',
      }}
    >
      <div
        className="rounded-full flex items-center justify-center text-white font-extrabold flex-shrink-0"
        style={{
          width: sm ? 18 : 24, height: sm ? 18 : 24,
          fontSize: sm ? 8 : 10,
          background: member.color,
        }}
      >
        {member.initials}
      </div>
      <span className="font-semibold" style={{ fontSize: sm ? 11 : 12, color: member.color }}>
        {role && <span style={{ fontWeight: 400, opacity: 0.7, marginRight: 2 }}>{role}</span>}
        {member.name}
      </span>
    </div>
  );
}
