import React from 'react';
import { mockMembers } from '../data/members.data';
import type { Member } from '../data/members.data';

const members: Member[] = mockMembers;

const MembersPage: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {members.map((member) => (
        <div key={member.id}
        className="bg-white rounded-xl p-4 h-20 cursor-pointer flex flex-row justify-start 
                    hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 gap-3 items-center"
        style={{ boxShadow: "rgba(0, 0, 0, 0.06) 0px 1px 3px" }}
        >
            <svg width="50" height="50" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20 L24 12 M44 20 L40 12"/><circle cx="32" cy="32" r="12"/><circle cx="28" cy="30" r="2"/><circle cx="36" cy="30" r="2"/><path d="M32 34 L31 35 L33 35 Z"/><path d="M30 36 Q32 38 34 36"/><path d="M22 30 H16 M22 32 H16 M42 30 H48 M42 32 H48"/><path d="M24 44 Q32 48 40 44 Q42 46 41 50 Q40 52 38 54 H26 Q24 52 23 50 Q22 46 24 44 Z"/><path d="M28 54 V58 M36 54 V58"/><path d="M40 50 Q48 52 46 46 Q45 44 42 44"/></svg>
            <div>
                <div className="text-sm font-semibold text-gray-800 truncate">{member.name}</div>
                <div className="text-xs text-gray-500">{member.role}</div>
            </div>
        </div>
        ))}
    </div>
  );
};
export default MembersPage;
