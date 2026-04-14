// app/page.tsx
export const dynamic = 'force-dynamic';

import { turso } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import StardewTitle from './StardewTitle';

type FruitOption = {
  value: string;
  image?: string;
  emoji?: string;
  label: string;
};

const fruitOptions: FruitOption[] = [
  { value: '🍌', image: '/Banana.png', label: 'Banana' },
  { value: '🍒', image: '/Cranberry.png', label: 'Cranberry' },
  { value: '🍇', image: '/grape.png', label: 'Grape' },
  { value: '🥭', image: '/Mango.png', label: 'Mango' },
  { value: '🍊', image: '/Orange.png', label: 'Orange' },
  { value: '🍑', image: '/Peach.png', label: 'Peach' },
  { value: '🍉', image: '/Powdermelon.png', label: 'Powdermelon' },
  { value: '⭐', image: '/Starfruit.png', label: 'Starfruit' },
  { value: '🍅', image: '/Tomato.png', label: 'Tomato' },
];

export default async function Home() {
  let farmers: any[] = [];
  try {
    const result = await turso.execute('SELECT * FROM farmers ORDER BY id DESC');
    farmers = result.rows;
  } catch (e) {
    console.error("Table might not exist yet.", e);
  }

  async function addNote(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const message = formData.get('message') as string;
    const fruit = formData.get('fruit') as string;

    if (!name || !message || !fruit) return;

    await turso.execute({
      sql: 'INSERT INTO farmers (name, message, favorite_fruit) VALUES (?, ?, ?)',
      args: [name, message, fruit]
    });

    revalidatePath('/');
  }

  async function deleteNote(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (!id) return;

    await turso.execute({
      sql: 'DELETE FROM farmers WHERE id = ?',
      args: [id]
    });

    revalidatePath('/');
  }

  return (
    <main className="min-h-screen p-6 md:p-10 flex flex-col items-center justify-center">
      <StardewTitle />

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">

        {/* ── Left: Form ── */}
        <div className="w-full md:w-[340px] shrink-0">
          <div className="stardew-dialogue">
            <h2
              className="text-center pb-3 mb-5 border-b-4 border-[#5A321A]"
              style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem', lineHeight: 1.8, color: '#5A321A' }}
            >
              Visitor Log
            </h2>

            <form action={addNote} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1">
                <label className="text-xl text-[#5A321A]">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Farmer Bob"
                  required
                  maxLength={20}
                  className="stardew-input"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xl text-[#5A321A]">Favorite Item</label>
                <div className="grid grid-cols-3 gap-2 bg-[#F4DFB0] p-2 rounded border-4 border-[#C88D50]"
                  style={{ boxShadow: 'inset 0 0 0 2px #5A321A' }}>
                  {fruitOptions.map((opt) => (
                    <label key={opt.value} className="fruit-option">
                      <input type="radio" name="fruit" value={opt.value} className="hidden" required />
                      {opt.image ? (
                        <img src={opt.image} alt={opt.label} className="w-8 h-8 object-contain drop-shadow-sm mb-1" style={{ imageRendering: 'pixelated' }} />
                      ) : (
                        <span className="fruit-emoji">{opt.emoji}</span>
                      )}
                      <span className="fruit-label">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xl text-[#5A321A]">Message</label>
                <textarea
                  name="message"
                  placeholder="I love Pelican Town!"
                  required
                  rows={3}
                  className="stardew-input resize-none"
                />
              </div>

              <button type="submit" className="pixel-btn mt-1">
                Leave Message
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: Entries ── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {farmers.length === 0 ? (
            <div className="stardew-dialogue text-center py-10">
              <p className="text-2xl italic text-[#5A321A]">The guestbook is empty...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-h-[620px] overflow-y-auto pr-1">
              {farmers.map((farmer, index) => (
                <div key={index} className="stardew-dialogue flex gap-4 items-start py-3 px-4">
                  <div className="shrink-0 w-14 h-14 flex items-center justify-center rounded-lg bg-[#F4DFB0] border-2 border-[#C88D50] text-4xl leading-none"
                    style={{ boxShadow: 'inset 0 0 0 1px #5A321A' }}>
                    {(() => {
                      const opt = fruitOptions.find(f => f.value === farmer.favorite_fruit);
                      if (opt && opt.image) {
                        return <img src={opt.image} alt="fruit" className="w-10 h-10 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />;
                      }
                      return farmer.favorite_fruit as string;
                    })()}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-[#5A321A] text-2xl leading-tight">{farmer.name as string}</span>
                    <p className="whitespace-pre-wrap break-words text-xl leading-snug mt-1">{farmer.message as string}</p>
                  </div>
                  <form action={deleteNote} className="shrink-0">
                    <input type="hidden" name="id" value={farmer.id as number} />
                    <button
                      type="submit"
                      title="Delete post"
                      className="delete-btn"
                    >
                      ✕
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
