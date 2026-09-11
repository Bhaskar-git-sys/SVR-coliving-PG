import { useState, useMemo } from 'react';
import {
  LayoutGrid,
  Users,
  BedDouble,
  TrendingUp,
  DoorOpen,
  CircleDot,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from 'lucide-react';
import type { PGData, Room, RoomType } from '@/types';
import { getRoomStatus, getVacantBeds, getRoomTypeCapacity } from '@/lib/storage';
import { getRoomPaymentStatus } from '@/lib/paymentMonitoring';
import RoomDetailModal from './RoomDetailModal';

interface RoomChartProps {
  data: PGData;
  setData: (d: PGData) => void;
}

const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
};

const STATUS_CONFIG = {
  available: { color: 'bg-emerald-500', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Available' },
  partial: { color: 'bg-amber-500', border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Partial' },
  full: { color: 'bg-red-500', border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', label: 'Full' },
};

type StatusFilter = 'all' | 'available' | 'partial' | 'full';

export default function RoomChart({ data, setData }: RoomChartProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const stats = useMemo(() => {
    const totalRooms = data.rooms.length;
    const totalBeds = data.rooms.reduce((sum, r) => sum + r.beds.length, 0);
    const occupiedBeds = data.rooms.reduce(
      (sum, r) => sum + r.beds.filter((b) => b.occupied).length,
      0
    );
    const vacantBeds = totalBeds - occupiedBeds;
    const occupiedRooms = data.rooms.filter((r) => r.beds.every((b) => b.occupied)).length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    return { totalRooms, totalBeds, occupiedBeds, vacantBeds, occupiedRooms, occupancyRate };
  }, [data.rooms]);

  const floors = useMemo(() => {
    const map = new Map<number, Room[]>();
    for (const room of data.rooms) {
      if (statusFilter !== 'all' && getRoomStatus(room) !== statusFilter) continue;
      if (!map.has(room.floor)) map.set(room.floor, []);
      map.get(room.floor)!.push(room);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [data.rooms, statusFilter]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl">SVR Co-Living PG</h1>
            <p className="text-navy-300 text-sm">6 Floors • 48 Rooms</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DoorOpen} label="Total Rooms" value={stats.totalRooms} color="navy" />
        <StatCard icon={BedDouble} label="Occupied Beds" value={stats.occupiedBeds} color="amber" />
        <StatCard icon={CircleDot} label="Vacant Beds" value={stats.vacantBeds} color="emerald" />
        <StatCard icon={TrendingUp} label="Occupancy Rate" value={`${stats.occupancyRate}%`} color="gold" />
      </div>

      {/* Legend / Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-navy-300 text-sm font-medium mr-2">Filter:</span>
        <FilterChip
          active={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
          label="All Rooms"
        />
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <FilterChip
            key={key}
            active={statusFilter === key}
            onClick={() => setStatusFilter(statusFilter === key ? 'all' : key as StatusFilter)}
            label={cfg.label}
            dotColor={cfg.color}
          />
        ))}
      </div>

      {/* Floor sections */}
      <div className="space-y-6">
        {floors.map(([floorNum, rooms], idx) => (
          <div
            key={floorNum}
            className="animate-slide-up"
            style={{ animationDelay: `${idx * 80}ms`, opacity: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center text-gold-400 font-bold text-sm">
                {floorNum}
              </div>
              <h2 className="font-display font-semibold text-lg text-white">Floor {floorNum}</h2>
              <div className="flex-1 h-px bg-navy-700" />
              <span className="text-navy-300 text-sm">{rooms.length} rooms</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {rooms.map((room) => {
                const status = getRoomStatus(room);
                const cfg = STATUS_CONFIG[status];
                const vacant = getVacantBeds(room).length;
                const occupied = room.beds.length - vacant;
                const paymentStatus = getRoomPaymentStatus(room, data.residents, data.payments);
                const paymentStatusConfig = paymentStatus === 'paid'
                  ? { label: 'Paid', color: 'text-emerald-400', Icon: CheckCircle2 }
                  : paymentStatus === 'overdue'
                    ? { label: 'Overdue', color: 'text-red-400', Icon: AlertTriangle }
                    : paymentStatus === 'pending'
                      ? { label: 'Pending', color: 'text-amber-400', Icon: Clock3 }
                      : null;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`group relative ${cfg.bg} ${cfg.border} border rounded-xl p-4 text-left hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-display font-bold text-xl text-white">{room.number}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
                    </div>
                    <p className="text-navy-300 text-xs mb-1">{ROOM_TYPE_LABEL[room.type]}</p>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Users className="w-3 h-3 text-navy-300" />
                      <span className={cfg.text}>
                        {occupied}/{room.beds.length}
                      </span>
                      {vacant > 0 && (
                        <span className="text-emerald-400 ml-auto">{vacant} free</span>
                      )}
                    </div>
                    {paymentStatusConfig && (
                      <div className={`flex items-center gap-1 mt-2 text-[10px] font-semibold ${paymentStatusConfig.color}`}>
                        <paymentStatusConfig.Icon className="w-3 h-3" />
                        {paymentStatusConfig.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Room Detail Modal */}
      {selectedRoom && (
        <RoomDetailModal
          room={data.rooms.find((r) => r.id === selectedRoom.id) || selectedRoom}
          data={data}
          setData={setData}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  );
}

function FilterChip(props: {
  active: boolean;
  onClick: () => void;
  label: string;
  dotColor?: string;
}) {
  return (
    <button
      onClick={props.onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        props.active
          ? 'bg-gold-400/15 text-gold-300 border border-gold-400/30'
          : 'text-navy-200 hover:text-white hover:bg-navy-700/50 border border-transparent'
      }`}
    >
      {props.dotColor && <span className={`w-2.5 h-2.5 rounded-full ${props.dotColor}`} />}
      {props.label}
    </button>
  );
}

function StatCard(props: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: 'navy' | 'amber' | 'emerald' | 'gold';
}) {
  const colorMap = {
    navy: 'text-navy-200 bg-navy-700/50',
    amber: 'text-amber-400 bg-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    gold: 'text-gold-400 bg-gold-400/10',
  };

  return (
    <div className="glass-dark rounded-xl p-4 border border-navy-700">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[props.color]}`}>
          <props.icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-navy-300 text-xs">{props.label}</p>
          <p className="font-display font-bold text-xl text-white">{props.value}</p>
        </div>
      </div>
    </div>
  );
}
