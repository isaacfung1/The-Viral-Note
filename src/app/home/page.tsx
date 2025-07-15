import react from 'react';
'use client';

export default function Home() {
    return (
        <div className = "flex flex-col">
            <div className = "flex flex-row">
                <button>
                    Higher
                </button>
                <button>
                    Lower
                </button>
            </div>
        </div>
    )
}