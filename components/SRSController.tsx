'use client'

interface SRSControllerProps {
  wordId: string;
  onGrade: (quality: number) => void;
}

export default function SRSController({ wordId, onGrade }: SRSControllerProps) {
  const grades = [
    { label: 'Again', val: 1, color: 'bg-red-500' },
    { label: 'Hard', val: 2, color: 'bg-orange-500' },
    { label: 'Good', val: 3, color: 'bg-indigo-500' },
    { label: 'Easy', val: 5, color: 'bg-green-500' }
  ];

  return (
    <div className="flex justify-center gap-4 mt-8">
      {grades.map((grade) => (
        <button
          key={grade.val}
          onClick={(e) => {
            e.stopPropagation();
            onGrade(grade.val);
          }}
          className={`${grade.color} text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95`}
        >
          {grade.label}
        </button>
      ))}
    </div>
  );
}
