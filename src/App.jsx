import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, X, Check, ArrowDown, ArrowRight, ArrowLeft, TrendingUp, Zap, RotateCcw, ZoomIn, ZoomOut, Eye, EyeOff } from 'lucide-react';

const TIER_DETAILS = {
  S: { id: 'S', name: 'Standard (10×10)', price: 300, dayPrice: 150,
       colors: 'bg-pink-100 border-pink-300 border-2 text-pink-400',
       assignedColors: 'bg-pink-400 border-black border-2 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
       dotColor: 'bg-pink-400 border border-black' },
  M: { id: 'M', name: 'Mid-Tier (10×15)', price: 500, dayPrice: 250,
       colors: 'bg-blue-100 border-blue-300 border-2 text-blue-400',
       assignedColors: 'bg-blue-400 border-black border-2 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
       dotColor: 'bg-blue-400 border border-black' },
  P: { id: 'P', name: 'Premium (10×20)', price: 800, dayPrice: 400,
       colors: 'bg-lime-100 border-lime-300 border-2 text-lime-500',
       assignedColors: 'bg-lime-400 border-black border-2 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
       dotColor: 'bg-lime-400 border border-black' }
};

const BOOTH_W = 60;
const CANVAS_W = 490;
const GAP = 3;

const BOOTH_H = { S: 44, M: 64, P: 86 };

const COLUMNS = [
  { letter: 'A', x: 14,  pattern: ['P','M','S','S','S','S','S','S','S','S','M','P'] },
  { letter: 'B', x: 104, pattern: ['M','S','S','S','S','S','S','S','S','S','S','S','M'] },
  { letter: 'C', x: 170, pattern: ['S','S','M','S','S','S','S','S','S','S','M','S','S'] },
  { letter: 'D', x: 260, pattern: ['S','S','M','S','S','S','S','S','S','S','M','S','S'] },
  { letter: 'E', x: 326, pattern: ['M','S','S','S','S','S','S','S','S','S','S','S','M'] },
  { letter: 'F', x: 416, pattern: ['P','M','S','S','S','S','S','S','S','S','M','P'] },
];

const AISLES = [
  { x: 74,  w: 30 },
  { x: 230, w: 30 },
  { x: 386, w: 30 },
];

const colHeight = (pattern) =>
  pattern.reduce((sum, t) => sum + BOOTH_H[t], 0) + (pattern.length - 1) * GAP;

const MAX_COL_H = Math.max(...COLUMNS.map(c => colHeight(c.pattern)));
const CANVAS_H = MAX_COL_H + 40;

const generateBooths = () => {
  const booths = [];

  COLUMNS.forEach(({ letter, x, pattern }) => {
    const h = colHeight(pattern);
    let y = 20 + Math.round((MAX_COL_H - h) / 2);
    pattern.forEach((type, i) => {
      const bh = BOOTH_H[type];
      booths.push({ id: `${letter}${i + 1}`, tier: type, x, y, w: BOOTH_W, h: bh });
      y += bh + GAP;
    });
  });

  return booths;
};

const INITIAL_BOOTHS = generateBooths();

const INITIAL_VENDORS = [
  { id: 'v1', name: 'Rust & Thread Vintage', category: 'Denim & Workwear', requestedTier: 'M' },
  { id: 'v2', name: 'Honeypot Collective', category: "70s & 80s Women's", requestedTier: 'S' },
  { id: 'v3', name: 'Dead Stock Dave', category: 'Sneakers & Streetwear', requestedTier: 'P' },
  { id: 'v4', name: 'The Velvet Fawn', category: 'Boho & Festival Wear', requestedTier: 'S' },
  { id: 'v5', name: 'Pacific Pickers', category: 'Surf & Skate Vintage', requestedTier: 'M' },
  { id: 'v6', name: "Goldie's Closet", category: 'Designer Vintage', requestedTier: 'P' },
  { id: 'v7', name: 'Sun Bleached', category: 'Vintage Tees', requestedTier: 'S' },
  { id: 'v8', name: 'Patina & Co', category: 'Leather & Accessories', requestedTier: 'S' },
  { id: 'v9', name: 'The Salvage Yard', category: 'Vintage Furniture', requestedTier: 'P' },
  { id: 'v10', name: 'Neon Revival', category: '90s Streetwear', requestedTier: 'M' },
  { id: 'v11', name: 'Ranch House Vintage', category: 'Western Wear', requestedTier: 'S' },
  { id: 'v12', name: 'The Archive SLO', category: 'Rare & Collectible', requestedTier: 'P' },
  { id: 'v13', name: 'Retrograde Rings', category: 'Vintage Jewelry', requestedTier: 'S' },
  { id: 'v14', name: 'Spin City Records', category: 'Vinyl & Cassettes', requestedTier: 'S' },
  { id: 'v15', name: 'Kitsch & Kin', category: 'Vintage Housewares', requestedTier: 'M' },
  { id: 'v16', name: 'Threadbare Finds', category: 'Handmade Goods', requestedTier: 'S' },
  { id: 'v17', name: 'Sole Survivor', category: 'Vintage Sneakers', requestedTier: 'S' },
  { id: 'v18', name: 'Tour Bus Tees', category: 'Band Tees', requestedTier: 'M' },
  { id: 'v19', name: 'Olive Drab Depot', category: 'Military Surplus', requestedTier: 'S' },
  { id: 'v20', name: 'Mid Mod Market', category: 'MCM Furniture', requestedTier: 'P' },
  { id: 'v21', name: 'Paper Trail Books', category: 'Books & Ephemera', requestedTier: 'S' },
  { id: 'v22', name: 'Millennium Bug', category: 'Y2K Fashion', requestedTier: 'S' },
  { id: 'v23', name: 'Denim Days', category: "Levi's & Americana", requestedTier: 'M' },
  { id: 'v24', name: 'Silk & Lace', category: 'Lingerie & Nightwear', requestedTier: 'S' },
  { id: 'v25', name: 'Groovy Glassware', category: 'Colored Glass & Decor', requestedTier: 'S' },
  { id: 'v26', name: 'The Brass Tack', category: 'Vintage Hardware', requestedTier: 'M' },
  { id: 'v27', name: 'Secondhand Starlight', category: '50s Prom & Evening', requestedTier: 'S' },
];

const INITIAL_ASSIGNMENTS = {
  'A1': 'v3',
  'A12': 'v6',
  'B1': 'v1',
  'C6': 'v2',
  'D4': 'v7'
};

export default function App() {
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredBooth, setHoveredBooth] = useState(null);
  const [activePopover, setActivePopover] = useState(null);
  const [dragOverBooth, setDragOverBooth] = useState(null);
  const [justDropped, setJustDropped] = useState(null);
  const [showEmpty, setShowEmpty] = useState(true);
  const floorRef = useRef(null);

  const MIN_ZOOM = 0.8;
  const MAX_ZOOM = 2.5;

  const viewRef = useRef({ baseScale: 1, zoom: 1, panX: 0, panY: 0 });
  const [viewTick, setViewTick] = useState(0);
  const forceViewUpdate = useCallback(() => setViewTick(t => t + 1), []);

  const v = viewRef.current;
  const floorScale = v.baseScale * v.zoom;
  const userZoom = v.zoom;

  const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  const resetZoom = useCallback(() => {
    viewRef.current.zoom = 1;
    viewRef.current.panX = 0;
    viewRef.current.panY = 0;
    forceViewUpdate();
  }, [forceViewUpdate]);

  const zoomBy = useCallback((factor) => {
    const el = floorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const v = viewRef.current;
    const oldScale = v.baseScale * v.zoom;
    v.zoom = clampZoom(v.zoom * factor);
    const newScale = v.baseScale * v.zoom;
    const ratio = newScale / oldScale;
    v.panX = cx - ratio * (cx - v.panX);
    v.panY = cy - ratio * (cy - v.panY);
    forceViewUpdate();
  }, [forceViewUpdate]);

  useEffect(() => {
    const el = floorRef.current;
    if (!el) return;
    const updateBase = () => {
      const pad = 100;
      const sx = el.clientWidth / (CANVAS_W + pad);
      const sy = el.clientHeight / (CANVAS_H + pad);
      viewRef.current.baseScale = Math.min(sx, sy, 1.6);
      forceViewUpdate();
    };
    updateBase();
    const ro = new ResizeObserver(updateBase);
    ro.observe(el);
    return () => ro.disconnect();
  }, [forceViewUpdate]);

  useEffect(() => {
    const el = floorRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      const speed = e.ctrlKey ? 0.008 : 0.002;
      const delta = -e.deltaY * speed;
      const v = viewRef.current;
      const oldZoom = v.zoom;
      v.zoom = clampZoom(v.zoom * (1 + delta));
      const oldScale = v.baseScale * oldZoom;
      const newScale = v.baseScale * v.zoom;
      const ratio = newScale / oldScale;
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      v.panX = mx - ratio * (mx - v.panX);
      v.panY = my - ratio * (my - v.panY);
      forceViewUpdate();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [forceViewUpdate]);

  useEffect(() => {
    const el = floorRef.current;
    if (!el) return;

    let initDist = null;
    let initZoom = null;
    let initMid = null;
    let initPan = null;

    const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const mid = (a, b) => ({ x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 });

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initDist = dist(e.touches[0], e.touches[1]);
        initZoom = viewRef.current.zoom;
        const rect = el.getBoundingClientRect();
        const m = mid(e.touches[0], e.touches[1]);
        initMid = { x: m.x - rect.left, y: m.y - rect.top };
        initPan = { x: viewRef.current.panX, y: viewRef.current.panY };
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && initDist != null) {
        e.preventDefault();
        const d = dist(e.touches[0], e.touches[1]);
        const v = viewRef.current;
        const oldScale = v.baseScale * v.zoom;
        v.zoom = clampZoom(initZoom * (d / initDist));
        const newScale = v.baseScale * v.zoom;
        const ratio = newScale / oldScale;
        v.panX = initMid.x - ratio * (initMid.x - initPan.x);
        v.panY = initMid.y - ratio * (initMid.y - initPan.y);
        forceViewUpdate();
      }
    };

    const onTouchEnd = () => { initDist = null; };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [forceViewUpdate]);

  const panState = useRef({ active: false, startX: 0, startY: 0, origPanX: 0, origPanY: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const onPanMouseDown = useCallback((e) => {
    if (e.target.closest('[data-booth]')) return;
    const ps = panState.current;
    ps.active = true;
    ps.startX = e.clientX;
    ps.startY = e.clientY;
    ps.origPanX = viewRef.current.panX;
    ps.origPanY = viewRef.current.panY;
    setIsPanning(true);
  }, []);

  const onPanMouseMove = useCallback((e) => {
    const ps = panState.current;
    if (!ps.active) return;
    viewRef.current.panX = ps.origPanX + (e.clientX - ps.startX);
    viewRef.current.panY = ps.origPanY + (e.clientY - ps.startY);
    forceViewUpdate();
  }, [forceViewUpdate]);

  const onPanMouseUp = useCallback(() => {
    panState.current.active = false;
    setIsPanning(false);
  }, []);

  const stats = useMemo(() => {
    const total = INITIAL_BOOTHS.length;
    const assigned = Object.keys(assignments).length;
    const revenue = Object.entries(assignments).reduce((sum, [boothId]) => {
      const booth = INITIAL_BOOTHS.find(b => b.id === boothId);
      return sum + (booth ? TIER_DETAILS[booth.tier].price : 0);
    }, 0);
    return { total, assigned, available: total - assigned, revenue };
  }, [assignments]);

  const filteredVendors = useMemo(() => {
    return INITIAL_VENDORS.filter(v =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleDragStart = (e, vendorId) => {
    e.dataTransfer.setData('vendorId', vendorId);
    setActivePopover(null);
  };

  const handleDrop = (e, boothId) => {
    e.preventDefault();
    setDragOverBooth(null);
    const vendorId = e.dataTransfer.getData('vendorId');
    if (vendorId) {
      assignVendor(boothId, vendorId);
      setJustDropped(boothId);
      setTimeout(() => setJustDropped(null), 600);
    }
  };

  const handleDragOver = (e, boothId) => {
    e.preventDefault();
    if (dragOverBooth !== boothId) setDragOverBooth(boothId);
  };

  const handleDragLeave = () => setDragOverBooth(null);

  const assignVendor = (boothId, vendorId) => {
    const newAssignments = { ...assignments };
    for (const key in newAssignments) {
      if (newAssignments[key] === vendorId) delete newAssignments[key];
    }
    newAssignments[boothId] = vendorId;
    setAssignments(newAssignments);
    setActivePopover(null);
  };

  const removeVendor = (boothId) => {
    const newAssignments = { ...assignments };
    delete newAssignments[boothId];
    setAssignments(newAssignments);
    setActivePopover(null);
  };

  const handleBoothClick = (boothId) => {
    setActivePopover({
      boothId,
      type: assignments[boothId] ? 'manage' : 'assign'
    });
  };

  return (
    <div className="flex h-screen w-full bg-[#f4f0ea] overflow-hidden font-sans text-black selection:bg-lime-300 selection:text-black">

      {/* FLOOR PLAN */}
      <div
        ref={floorRef}
        className={`flex-1 overflow-hidden border-r-4 border-black relative select-none
          ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}
        `}
        onMouseDown={onPanMouseDown}
        onMouseMove={onPanMouseMove}
        onMouseUp={onPanMouseUp}
        onMouseLeave={onPanMouseUp}
      >
        {/* Zoom controls */}
        <div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5">
          <button
            onClick={() => zoomBy(1.3)}
            className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-1.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <ZoomIn size={16} strokeWidth={3} />
          </button>
          <button
            onClick={() => zoomBy(0.77)}
            className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-1.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <ZoomOut size={16} strokeWidth={3} />
          </button>
          {userZoom !== 1 && (
            <button
              onClick={resetZoom}
              className="bg-lime-300 border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-1.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              title="Reset zoom"
            >
              <RotateCcw size={16} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* Empty booth toggle + zoom indicator */}
        <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2">
          <button
            onClick={() => setShowEmpty(s => !s)}
            className={`flex items-center gap-1.5 border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] px-2.5 py-1.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all
              ${showEmpty ? 'bg-white' : 'bg-pink-300'}
            `}
            title={showEmpty ? 'Hide empty booths' : 'Show empty booths'}
          >
            {showEmpty ? <EyeOff size={12} strokeWidth={3} /> : <Eye size={12} strokeWidth={3} />}
            <span className="text-[9px] font-black uppercase tracking-wider">{showEmpty ? 'Hide Empty' : 'Show Empty'}</span>
          </button>
          <div className="bg-white/80 border border-black/20 rounded-md px-2 py-1">
            <span className="text-[9px] font-black font-mono text-black/50 uppercase">{Math.round(userZoom * 100)}%</span>
          </div>
        </div>

        <div
          className="absolute"
          style={{
            transform: `translate(${v.panX}px, ${v.panY}px) scale(${floorScale})`,
            transformOrigin: '0 0',
            left: `calc(50% - ${CANVAS_W / 2}px)`,
            top: `calc(50% - ${(CANVAS_H + 80) / 2}px)`,
            transition: isPanning ? 'none' : undefined,
          }}
        >
          <div className="flex flex-col items-center gap-3">

          {/* TOP ENTRANCE */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-[2px] w-12 bg-black/20" />
            <div className="bg-white text-black text-[10px] font-black tracking-[0.2em] px-5 py-2 rounded-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase flex items-center gap-2">
              <ArrowDown size={12} strokeWidth={3} />
              Entrance
              <ArrowDown size={12} strokeWidth={3} />
            </div>
            <div className="h-[2px] w-12 bg-black/20" />
          </div>

          {/* CANVAS */}
          <div
            className="relative bg-[#fdfbf7] border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shrink-0"
            style={{ width: `${CANVAS_W}px`, height: `${CANVAS_H}px` }}
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Vertical aisles */}
            {AISLES.map((aisle, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 pointer-events-none z-[1] flex flex-col items-center justify-center"
                style={{ left: `${aisle.x}px`, width: `${aisle.w}px` }}
              >
                <div className="flex-1 flex items-center">
                  <div className="h-full w-[1px] border-l border-dashed border-black/8" />
                </div>
              </div>
            ))}

            {/* Back-to-back island fills */}
            {[{ x: 164, w: 6 }, { x: 320, w: 6 }].map((island, i) => (
              <div
                key={i}
                className="absolute top-[8%] bottom-[8%] bg-black/[0.03] rounded-full pointer-events-none"
                style={{ left: `${island.x}px`, width: `${island.w}px` }}
              />
            ))}

            {/* Booths */}
            {INITIAL_BOOTHS.map((booth) => {
              const tier = TIER_DETAILS[booth.tier];
              const assignedVendorId = assignments[booth.id];
              const vendor = assignedVendorId ? INITIAL_VENDORS.find(v => v.id === assignedVendorId) : null;
              if (!showEmpty && !vendor) return null;
              const isActive = activePopover?.boothId === booth.id;
              const isDragTarget = dragOverBooth === booth.id;
              const isSwapTarget = isDragTarget && !!vendor;
              const isDropTarget = isDragTarget && !vendor;
              const isDropPop = justDropped === booth.id;

              return (
                <div
                  key={booth.id}
                  data-booth
                  draggable={!!vendor}
                  onDragStart={(e) => vendor && handleDragStart(e, vendor.id)}
                  onDragOver={(e) => handleDragOver(e, booth.id)}
                  onDragEnter={(e) => { e.preventDefault(); setDragOverBooth(booth.id); }}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, booth.id)}
                  onClick={() => handleBoothClick(booth.id)}
                  onMouseEnter={() => setHoveredBooth(booth.id)}
                  onMouseLeave={() => setHoveredBooth(null)}
                  className={`absolute flex flex-col items-center justify-center cursor-pointer rounded-lg
                    ${isDropPop
                      ? 'z-30 animate-[dropPop_0.5s_ease-out]'
                      : 'transition-all duration-150 ease-out'
                    }
                    ${vendor ? tier.assignedColors : tier.colors}
                    ${isDropTarget
                      ? 'scale-110 z-20 ring-4 ring-lime-400 ring-offset-2 ring-offset-[#fdfbf7] shadow-[0_0_20px_rgba(163,230,53,0.5)] border-black! border-2!'
                      : isSwapTarget
                        ? 'scale-110 z-20 ring-4 ring-blue-400 ring-offset-2 ring-offset-[#fdfbf7] shadow-[0_0_20px_rgba(96,165,250,0.5)] border-black! border-2!'
                        : isActive
                          ? 'ring-4 ring-black ring-offset-2 ring-offset-[#fdfbf7] z-20 scale-105'
                          : 'hover:-translate-x-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] z-10'
                    }
                  `}
                  style={{
                    left: `${booth.x}px`,
                    top: `${booth.y}px`,
                    width: `${booth.w}px`,
                    height: `${booth.h}px`,
                  }}
                >
                  {isDropTarget ? (
                    <div className="text-center">
                      <div className="text-lg font-black text-lime-600 leading-none">+</div>
                      <div className="text-[8px] font-black text-lime-600 uppercase tracking-wider mt-0.5">Drop</div>
                    </div>
                  ) : isSwapTarget ? (
                    <div className="text-center">
                      <div className="text-sm font-black text-blue-600 leading-none">&#x21C4;</div>
                      <div className="text-[8px] font-black text-blue-600 uppercase tracking-wider mt-0.5">Swap</div>
                    </div>
                  ) : vendor ? (
                    <div className="w-full px-1 text-center overflow-hidden">
                      <div className="text-[8px] font-black opacity-70 tracking-tight">{booth.id}</div>
                      <div className={`text-[10px] font-black leading-tight uppercase tracking-tight ${booth.h > 50 ? 'line-clamp-2' : 'line-clamp-1'}`}>
                        {vendor.name}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-xs font-black tracking-tight">{booth.id}</div>
                      <div className="text-[8px] font-mono font-bold opacity-60 uppercase tracking-widest">{booth.tier}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* BOTTOM ENTRANCE */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-[2px] w-12 bg-black/20" />
            <div className="bg-white text-black text-[10px] font-black tracking-[0.2em] px-5 py-2 rounded-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase flex items-center gap-2">
              <ArrowDown size={12} strokeWidth={3} className="rotate-180" />
              Entrance
              <ArrowDown size={12} strokeWidth={3} className="rotate-180" />
            </div>
            <div className="h-[2px] w-12 bg-black/20" />
          </div>

          {/* LEGEND */}
          <div className="flex items-center gap-5 bg-white border-2 border-black px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] shrink-0">
            {Object.values(TIER_DETAILS).map(t => (
              <div key={t.id} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight text-black">
                <div className={`w-3.5 h-3.5 rounded ${t.colors}`} />
                <span>{t.name}</span>
                <span className="font-mono text-black/50">${t.price}</span>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* ASSIGNMENT MODAL */}
      {activePopover && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setActivePopover(null)} />
          <div className="relative bg-white border-4 border-black rounded-xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-[360px] overflow-hidden">
            <PopoverContent
              activePopover={activePopover}
              booth={INITIAL_BOOTHS.find(b => b.id === activePopover.boothId)}
              vendor={INITIAL_VENDORS.find(v => v.id === assignments[activePopover.boothId])}
              unassignedVendors={INITIAL_VENDORS.filter(v => !Object.values(assignments).includes(v.id))}
              onAssign={(vId) => assignVendor(activePopover.boothId, vId)}
              onRemove={() => removeVendor(activePopover.boothId)}
              onClose={() => setActivePopover(null)}
            />
          </div>
        </div>
      )}

      {/* TOOLTIP */}
      {hoveredBooth && !activePopover && (
        <BoothTooltip
          booth={INITIAL_BOOTHS.find(b => b.id === hoveredBooth)}
          vendor={INITIAL_VENDORS.find(v => v.id === assignments[hoveredBooth])}
        />
      )}

      {/* SIDEBAR */}
      <div className="w-[420px] bg-white flex flex-col h-full z-30">
        <div className="p-6 border-b-4 border-black bg-lime-300 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-black leading-none uppercase tracking-tighter mb-2">Thrifty Beaches</h1>
            <h2 className="text-sm font-black font-mono bg-black text-lime-300 inline-block px-2 py-1 uppercase tracking-widest">Vintage Swap Meet</h2>
            <p className="text-xs font-black text-black mt-4 flex items-center gap-1.5 uppercase tracking-wide">
              <MapPin size={16} strokeWidth={3} /> April 12-13, 2026
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-0 border-b-4 border-black bg-stone-100">
          <StatBox label="Assigned" value={`${stats.assigned} / ${stats.total}`} borderRight />
          <StatBox label="Available" value={stats.available} />
        </div>
        <RevenueBar revenue={stats.revenue} assigned={stats.assigned} total={stats.total} />

        <div className="p-4 border-b-4 border-black bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18} strokeWidth={3} />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#fdfbf7] border-2 border-black text-sm font-bold rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-4 focus:ring-lime-300 transition-all placeholder:text-stone-400 placeholder:font-bold"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-[#f4f0ea]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[10px] font-black font-mono text-black uppercase tracking-widest">Registered Vendors</h2>
            <span className="text-xs font-black text-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-2 py-0.5 rounded-full">{filteredVendors.length}</span>
          </div>

          <div className="space-y-4">
            {filteredVendors.length === 0 ? (
              <div className="text-center py-8 text-black font-bold uppercase tracking-tight">No vendors found.</div>
            ) : (
              filteredVendors.map(vendor => {
                const assignedBoothId = Object.keys(assignments).find(key => assignments[key] === vendor.id);
                const isAssigned = !!assignedBoothId;
                const reqTier = TIER_DETAILS[vendor.requestedTier];

                return (
                  <div
                    key={vendor.id}
                    draggable={!isAssigned}
                    onDragStart={(e) => !isAssigned && handleDragStart(e, vendor.id)}
                    className={`group relative rounded-xl p-4 transition-all duration-200
                      ${isAssigned
                        ? 'bg-stone-200 border-2 border-dashed border-stone-400 opacity-60'
                        : 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-grab active:cursor-grabbing'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="pr-4">
                        <h3 className="font-black text-black uppercase tracking-tight text-lg leading-tight">
                          {vendor.name}
                        </h3>
                        <p className="text-[10px] font-mono font-bold text-stone-500 mt-1 uppercase tracking-widest">{vendor.category}</p>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <div className={`w-2.5 h-2.5 rounded-full ${reqTier.dotColor}`} />
                          <span className="text-[10px] font-black text-black">{vendor.requestedTier}</span>
                        </div>
                      </div>
                    </div>

                    {isAssigned && (
                      <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-black bg-lime-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] py-1.5 px-3 rounded-lg w-fit uppercase tracking-tight">
                        <Check size={14} strokeWidth={3} /> Booth {assignedBoothId}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PopoverContent({ activePopover, booth, vendor, unassignedVendors, onAssign, onRemove, onClose }) {
  const tier = TIER_DETAILS[booth.tier];

  return (
    <div className="flex flex-col">
      <div className={`p-5 border-b-4 border-black flex justify-between items-start ${tier.colors.replace('border-2', '')}`}>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-black text-3xl tracking-tighter">{booth.id}</h3>
            <span className="px-2 py-1 bg-white border-2 border-black rounded-md text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{tier.name}</span>
          </div>
          <p className="text-sm font-bold font-mono tracking-tight">${tier.price} / weekend</p>
        </div>
        <button onClick={onClose} className="p-1.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
          <X size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="p-5 bg-white">
        {activePopover.type === 'manage' && vendor ? (
          <div>
            <div className="mb-6 bg-[#f4f0ea] p-4 border-2 border-black rounded-xl">
              <p className="text-[10px] font-black font-mono text-stone-500 uppercase tracking-widest mb-2">Assigned Vendor</p>
              <h4 className="font-black text-xl text-black uppercase tracking-tight leading-tight">{vendor.name}</h4>
              <p className="text-xs font-bold font-mono text-stone-600 mt-1 uppercase tracking-wider">{vendor.category}</p>
            </div>
            <button
              onClick={onRemove}
              className="w-full py-3 px-4 bg-red-400 border-2 border-black text-black font-black uppercase tracking-widest text-sm rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex justify-center items-center gap-2"
            >
              <X size={18} strokeWidth={3} /> Remove
            </button>
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-black font-mono text-stone-500 uppercase tracking-widest mb-3">Assign a Vendor</p>
            {unassignedVendors.length === 0 ? (
              <p className="text-sm font-bold text-black text-center py-6 bg-stone-100 border-2 border-dashed border-stone-300 rounded-xl">All vendors assigned.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {unassignedVendors.map(v => (
                  <button
                    key={v.id}
                    onClick={() => onAssign(v.id)}
                    className="w-full text-left p-3 bg-white border-2 border-black rounded-xl hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex justify-between items-center group"
                  >
                    <div>
                      <div className="font-black text-black uppercase tracking-tight text-sm">{v.name}</div>
                      <div className="text-[10px] font-mono font-bold text-stone-500 uppercase mt-0.5">{v.category}</div>
                    </div>
                    {v.requestedTier === booth.tier && (
                      <span className="text-[10px] font-black text-black bg-lime-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-2 py-1 rounded-md uppercase tracking-wide">Match</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BoothTooltip({ booth, vendor }) {
  const tier = TIER_DETAILS[booth.tier];

  return (
    <div className="fixed bottom-6 left-6 bg-white border-4 border-black text-black p-4 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-40 w-56 pointer-events-none">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="font-black text-2xl tracking-tighter leading-none">{booth.id}</span>
          <span className={`text-[10px] font-black ${tier.colors.split(' ')[0]} border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-1.5 py-0.5 rounded-md uppercase tracking-wider`}>{booth.tier}</span>
        </div>
        <div className="text-right">
          <div className="font-black text-lg tracking-tight leading-none">${tier.price}</div>
          <div className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest mt-1">weekend</div>
        </div>
      </div>
      <div className="pt-3 border-t-4 border-black">
        {vendor ? (
          <div>
            <div className="text-[9px] font-black font-mono text-stone-500 uppercase tracking-widest mb-1">Assigned Vendor</div>
            <div className="font-black text-sm uppercase tracking-tight truncate">{vendor.name}</div>
          </div>
        ) : (
          <div className="text-xs font-black font-mono text-stone-400 uppercase tracking-widest">Unassigned Space</div>
        )}
      </div>
    </div>
  );
}

function RevenueBar({ revenue, assigned, total }) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevRevenue = useRef(0);

  const maxRevenue = useMemo(() => {
    return INITIAL_BOOTHS.reduce((sum, b) => sum + TIER_DETAILS[b.tier].price, 0);
  }, []);

  const pct = Math.round((revenue / maxRevenue) * 100);

  useEffect(() => {
    const start = prevRevenue.current;
    const end = revenue;
    prevRevenue.current = revenue;
    if (start === end) { setDisplayValue(end); return; }

    const duration = 600;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [revenue]);

  const barColor =
    pct > 66 ? 'bg-lime-400' :
    pct > 33 ? 'bg-blue-400' :
    'bg-pink-400';

  return (
    <div className="border-b-4 border-black bg-[#fdfbf7] relative overflow-hidden group">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 10px)',
        }}
      />

      <div className="relative p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-black rounded-lg">
              <TrendingUp size={14} strokeWidth={3} className="text-lime-300" />
            </div>
            <p className="text-[10px] font-black font-mono text-black/60 uppercase tracking-widest">Projected Revenue</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black font-mono text-black/40 uppercase tracking-widest">
            <span>{pct}% capacity</span>
          </div>
        </div>

        <div className="flex items-end justify-between mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black tracking-tighter text-black tabular-nums">
              ${displayValue.toLocaleString()}
            </span>
            <span className="text-sm font-black font-mono text-black/30 uppercase tracking-wider mb-0.5">
              / ${maxRevenue.toLocaleString()}
            </span>
          </div>
          {pct > 50 && (
            <div className="flex items-center gap-1 bg-lime-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-2 py-1 rounded-lg">
              <Zap size={12} strokeWidth={3} className="text-black" />
              <span className="text-[10px] font-black uppercase tracking-wider">On Fire</span>
            </div>
          )}
        </div>

        <div className="h-5 bg-white border-2 border-black rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out relative overflow-hidden`}
            style={{ width: `${Math.max(pct, 2)}%` }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent 0, transparent 6px, rgba(0,0,0,0.15) 6px, rgba(0,0,0,0.15) 12px)',
              }}
            />
          </div>
        </div>

        <div className="flex justify-between mt-2">
          <span className="text-[9px] font-black font-mono text-black/30 uppercase tracking-widest">{assigned} booths filled</span>
          <span className="text-[9px] font-black font-mono text-black/30 uppercase tracking-widest">{total} total</span>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, bg = "bg-white", colSpan = 1, borderRight = false, borderTop = false }) {
  return (
    <div className={`${bg} p-5 ${colSpan === 2 ? 'col-span-2' : 'col-span-1'} ${borderRight ? 'border-r-4 border-black' : ''} ${borderTop ? 'border-t-4 border-black' : ''}`}>
      <p className="text-[10px] font-black font-mono text-black/60 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black tracking-tighter text-black">{value}</p>
    </div>
  );
}
