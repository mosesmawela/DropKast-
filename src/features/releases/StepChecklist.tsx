import { ChevronLeft, ChevronRight, CheckSquare, ListTodo, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import ProductionOptions from './ProductionOptions';

interface StepChecklistProps {
  data: any;
  update: (fields: any) => void;
  next: () => void;
  back: () => void;
}

export default function StepChecklist({ data, update, next, back }: StepChecklistProps) {
  const sections = [
    {
      id: 'project_meta',
      title: 'Project metadata',
      fields: [
        { key: 'project_name', label: 'Project Name', type: 'text', placeholder: 'I JUST WANNA ROCK', sync: 'title' },
        { key: 'artist_name', label: 'Primary Artist(s)', type: 'text', placeholder: 'COLKAZE, UNCOOL MC', sync: 'artist' },
        { key: 'contact_email', label: 'Contact Email', type: 'email', placeholder: 'MANAGEMENT@DROPKAST.IO' },
        { key: 'upc', label: 'UPC #', type: 'text', placeholder: '725485XXXX' },
        { key: 'product_type', label: 'Product Type', type: 'select', options: ['Single', 'EP', 'Album', 'Deluxe'], sync: 'format' },
        { key: 'product_version', label: 'Product Version', type: 'text', placeholder: 'N/A or REMIX' },
        { key: 'track_count', label: 'Track Count', type: 'number', placeholder: '1' },
        { key: 'track_duration', label: 'Track Duration', type: 'text', placeholder: '03:45' },
        { key: 'genre', label: 'Primary Genre', type: 'text', placeholder: 'AMAPIANO', sync: 'genre' },
        { key: 'sub_genre', label: 'Sub-Genre', type: 'text', placeholder: 'DANCE / AFRO-HOUSE' },
        { key: 'tiktok_stamp', label: 'TikTok Time Stamp', type: 'text', placeholder: '01:25' },
        { key: 'lyric_language', label: 'Lyric Language', type: 'text', placeholder: 'ZULU / ENGLISH' },
        { key: 'explicit', label: 'Explicit Content?', type: 'checkbox' },
      ]
    },
    {
      id: 'content_details',
      title: 'CONTENT_SPECIFICS',
      fields: [
        { key: 'track_blurb', label: 'Track Blurb / Story', type: 'textarea', placeholder: 'THE INSPIRATION BEHIND THE NODE...' },
        { key: 'track_details', label: 'Track Details', type: 'textarea', placeholder: 'TECHNICAL NOTES, KEY, BPM...' },
        { key: 'similar_artists', label: 'Similar Artists', type: 'text', placeholder: 'LUNA RAY, SOLA...' },
        { key: 'has_features', label: 'Has Features?', type: 'checkbox' },
        { key: 'featured_artists', label: 'Featured Artists', type: 'text', placeholder: 'GUEST ARTIST NAMES' },
      ]
    },
    {
      id: 'campaign',
      title: 'Campaign strategy',
      fields: [
        { key: 'campaign_goals', label: 'Campaign Goals', type: 'text', placeholder: 'VIRAL_GROWTH, STREAM_MAXIMIZATION...' },
        { key: 'priority_markets', label: 'Priority Markets', type: 'text', placeholder: 'USA, UK, SOUTH AFRICA...' },
      ]
    },
    {
      id: 'timeline',
      title: 'Release timing',
      fields: [
        { key: 'release_date', label: 'Release Date', type: 'date', sync: 'releaseDate' },
        { key: 'sales_date', label: 'Sales Date', type: 'date' },
        { key: 'presave_active', label: 'Pre-order/Pre-save?', type: 'checkbox' },
        { key: 'presave_date', label: 'Pre-save Start Date', type: 'date' },
      ]
    },
    {
      id: 'assets_links',
      title: 'Assets & links',
      fields: [
        { key: 'final_master_link', label: 'Final Master Link (24bit/48k WAV)', type: 'text', placeholder: 'DRIVE/DROPBOX_LINK' },
        { key: 'artwork_link', label: 'Artwork Link (3000x3000px JPG)', type: 'text', placeholder: 'DRIVE/DROPBOX_LINK' },
        { key: 'lyrics_link', label: 'Lyrics Link', type: 'text', placeholder: 'GOOGLE_DOC_LINK' },
        { key: 'atmos_link', label: 'Atmos Mix Link', type: 'text', placeholder: 'SPATIAL_AUDIO_NODE' },
      ]
    },
    {
      id: 'engineering',
      title: 'SONIC_ENGINEERING_ARRAY',
      fields: [
        { key: 'mixing_engineer', label: 'Mixing Engineer', type: 'text', placeholder: 'AL XAPO & XDUPPY' },
        { key: 'mastering_engineer', label: 'Mastering Engineer', type: 'text', placeholder: 'AL XAPO & XDUPPY' },
        { key: 'recording_engineer', label: 'Recording Engineer', type: 'text', placeholder: 'AL XAPO & XDUPPY' },
        { key: 'country_recording', label: 'Country of Recording', type: 'text', placeholder: 'REPUBLIC OF SOUTH AFRICA' },
        { key: 'artist_origin', label: 'Artist Origin', type: 'text', placeholder: 'PRETORIA, SA' },
      ]
    },
    {
      id: 'rights',
      title: 'RIGHTS_&_EXPLOITATION',
      fields: [
        { key: 'publishing_line', label: 'Publishing Line', type: 'text', placeholder: 'LVRN' },
        { key: 'copyright_line', label: 'Copyright Line', type: 'text', placeholder: 'LVRN' },
        { key: 'ownership_note', label: 'Ownership Note', type: 'text', placeholder: 'ORIGINAL MASTER COPYRIGHT OWNER' },
        { key: 'producers', label: 'Producers', type: 'text', placeholder: 'GOMOLEMO JOY GUMEDE' },
        { key: 'writers', label: 'Writers (Legal Names)', type: 'text', placeholder: 'SIYABONGA MSIMANGO, THANDO SIBEKO' },
        { key: 'publishing_splits', label: 'Publishing Splits %', type: 'text', placeholder: '25/25/25/25' },
      ]
    },
    {
      id: 'dsp_mapping',
      title: 'Artist links',
      fields: [
        { key: 'spotify_artist_link', label: 'Spotify Artist Link', type: 'text', placeholder: 'SPOTIFY_URL' },
        { key: 'apple_artist_link', label: 'Apple Music Artist Link', type: 'text', placeholder: 'APPLE_URL' },
        { key: 'instagram_handle', label: 'Instagram @', type: 'text', placeholder: 'SOCIAL_TAG' },
      ]
    }
  ];

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter font-mono flex items-center gap-4">
            <ListTodo className="w-10 h-10 text-primary" />
            Release details
          </h2>
          <p className="text-white/40 text-xs font-medium italic max-w-xl leading-relaxed">
            Title, artist, ISRC, credits — everything DSPs need to display and pay you correctly.
          </p>
        </div>
        <div className="h-20 w-20 border border-white/5 bg-white/[0.02] flex items-center justify-center">
           <div className="text-[10px] font-black font-mono text-primary animate-pulse uppercase italic">Ready</div>
        </div>
      </div>

      <div className="space-y-16 max-h-[70vh] overflow-y-auto pr-8 custom-scrollbar">
        {sections.map((section, sIdx) => (
          <section key={section.id} className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-primary font-mono font-black italic text-lg">0{sIdx + 1}</span>
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] font-mono italic border-b border-white/10 pb-2 flex-1">
                {section.title}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {section.fields.map((field) => (
                <div key={field.key} className={cn("space-y-3", field.type === 'textarea' && "md:col-span-2")}>
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] font-mono italic">
                    {field.label}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea 
                      value={data[field.key] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updateObj: any = { [field.key]: val };
                        if ((field as any).sync) updateObj[(field as any).sync] = val;
                        update(updateObj);
                      }}
                      placeholder={field.placeholder}
                      className="w-full bg-white/[0.03] border border-white/10 p-5 text-white font-mono text-[11px] focus:outline-none focus:border-primary transition-all uppercase placeholder:opacity-10 min-h-[120px] resize-none"
                    />
                  ) : field.type === 'select' ? (
                    <select 
                      value={data[field.key] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updateObj: any = { [field.key]: val };
                        if ((field as any).sync) updateObj[(field as any).sync] = val;
                        update(updateObj);
                      }}
                      className="w-full bg-white/[0.03] border border-white/10 p-5 text-white font-mono text-[11px] focus:outline-none focus:border-primary transition-all uppercase appearance-none"
                    >
                      <option value="">SELECT_OPTION</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center gap-4 h-14">
                      <input 
                        type="checkbox"
                        checked={!!data[field.key]}
                        onChange={(e) => {
                          const val = e.target.checked;
                          const updateObj: any = { [field.key]: val };
                          if ((field as any).sync) updateObj[(field as any).sync] = val;
                          update(updateObj);
                        }}
                        className="w-6 h-6 bg-white/5 border border-white/10 accent-primary focus:ring-0"
                      />
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest font-mono italic">
                        {data[field.key] ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                  ) : (
                    <input 
                      type={field.type}
                      value={data[field.key] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updateObj: any = { [field.key]: val };
                        if ((field as any).sync) updateObj[(field as any).sync] = val;
                        update(updateObj);
                      }}
                      placeholder={field.placeholder}
                      className="w-full bg-white/[0.03] border border-white/10 p-5 text-white font-mono text-[11px] focus:outline-none focus:border-primary transition-all uppercase placeholder:opacity-10 h-14"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Production Options — Amuse/DistroKid-style premium add-ons */}
      <div className="border-t border-white/10 pt-10">
        <ProductionOptions data={data} update={update} />
      </div>

      <div className="flex justify-between pt-12 items-center border-t border-white/5">
        <button
          onClick={back}
          className="flex items-center gap-3 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] font-mono italic"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={next}
          className="h-14 px-10 bg-white text-black hover:bg-primary hover:text-white font-black italic tracking-widest uppercase text-[11px] transition-all active:scale-95 flex items-center gap-3"
        >
          Continue to artwork
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
