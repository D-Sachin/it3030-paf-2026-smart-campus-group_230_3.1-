import React from "react";
import { 
  Trash2, 
  Edit2, 
  MapPin, 
  Users, 
  Clock, 
  Tag, 
  Building2, 
  Microscope, 
  Users2, 
  Wrench,
  Box,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

/**
 * ResourceCard Component
 * Displays a single resource in card format
 */
const ResourceCard = ({ resource, onEdit, onDelete, canEdit }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "ACTIVE":
        return { 
          color: "text-success bg-green-50 border-green-100", 
          icon: CheckCircle2, 
          label: "Active" 
        };
      case "OUT_OF_SERVICE":
        return { 
          color: "text-error bg-red-50 border-red-100", 
          icon: AlertTriangle, 
          label: "Maintenance" 
        };
      default:
        return { 
          color: "text-slate-500 bg-slate-50 border-slate-100", 
          icon: Clock, 
          label: status 
        };
    }
  };

  const statusConfig = getStatusConfig(resource.status);

  const getTypeIcon = (type) => {
    switch (type) {
      case "LECTURE_HALL": return Building2;
      case "LAB": return Microscope;
      case "MEETING_ROOM": return Users2;
      case "EQUIPMENT": return Wrench;
      default: return Box;
    }
  };

  const TypeIcon = getTypeIcon(resource.type);

  return (
    <div className="premium-card group hover:scale-[1.02] transition-all p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-inner group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
            <TypeIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{resource.name}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">REF: {resource.id}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase ${statusConfig.color}`}>
          <statusConfig.icon className="w-3 h-3" />
          {statusConfig.label}
        </div>
      </div>

      {/* Description */}
      {resource.description && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">
          {resource.description}
        </p>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-y-4 mb-6 pt-6 border-t border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-600 truncate">{resource.location}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-600">{resource.capacity} Seats</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
            <Tag className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-600">{resource.resourceTypeDisplay || resource.type}</span>
        </div>
        {resource.availableFrom && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600">{resource.availabilityWindow || 'Daily'}</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {canEdit && (
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-transform">
          <button
            onClick={() => onEdit(resource)}
            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            title="Edit Resource"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(resource.id)}
            className="p-2 text-slate-400 hover:text-error hover:bg-red-50 rounded-lg transition-all"
            title="Delete Resource"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ResourceCard;
