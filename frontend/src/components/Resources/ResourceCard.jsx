import React from "react";
import { useNavigate } from "react-router-dom";
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
  AlertTriangle,
  BookOpen,
} from "lucide-react";

/**
 * ResourceCard Component
 * Displays a single resource in card format
 */
const ResourceCard = ({ resource, onEdit, onDelete, canEdit }) => {
  const navigate = useNavigate();
  const getStatusConfig = (status) => {
    switch (status) {
      case "ACTIVE":
        return {
          color: "#10b981",
          bgColor: "rgba(16, 185, 129, 0.1)",
          borderColor: "rgba(16, 185, 129, 0.2)",
          icon: CheckCircle2,
          label: "Active",
        };
      case "OUT_OF_SERVICE":
        return {
          color: "#ef4444",
          bgColor: "rgba(239, 68, 68, 0.1)",
          borderColor: "rgba(239, 68, 68, 0.2)",
          icon: AlertTriangle,
          label: "Maintenance",
        };
      default:
        return {
          color: "#9BA8AB",
          bgColor: "#11212D",
          borderColor: "#253745",
          icon: Clock,
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(resource.status);

  const getTypeIcon = (type) => {
    switch (type) {
      case "LECTURE_HALL":
        return Building2;
      case "LAB":
        return Microscope;
      case "MEETING_ROOM":
        return Users2;
      case "EQUIPMENT":
        return Wrench;
      default:
        return Box;
    }
  };

  const TypeIcon = getTypeIcon(resource.type);

  return (
    <div
      className="group hover:scale-[1.02] transition-all p-6 rounded-[32px] shadow-xl"
      style={{ backgroundColor: "#253745", border: "1px solid #4A5C6A" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-300"
            style={{
              backgroundColor: "rgba(45, 112, 163, 0.15)",
              color: "#1c4f78",
            }}
          >
            <TypeIcon className="w-6 h-6" />
          </div>
          <div>
            <h3
              className="font-bold transition-colors"
              style={{ color: "#CCD0CF" }}
            >
              {resource.name}
            </h3>
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "#4A5C6A" }}
            >
              REF: {resource.id}
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase"
          style={{
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.color,
            borderColor: statusConfig.borderColor,
          }}
        >
          <statusConfig.icon className="w-3 h-3" />
          {statusConfig.label}
        </div>
      </div>

      {/* Description */}
      {resource.description && (
        <p
          className="text-sm line-clamp-2 mb-6 font-medium leading-relaxed"
          style={{ color: "#9BA8AB" }}
        >
          {resource.description}
        </p>
      )}

      {/* Info Grid */}
      <div
        className="grid grid-cols-2 gap-y-4 mb-6 pt-6"
        style={{ borderTop: "1px solid #4A5C6A" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#11212D", color: "#4A5C6A" }}
          >
            <MapPin className="w-4 h-4" />
          </div>
          <span
            className="text-xs font-bold truncate"
            style={{ color: "#9BA8AB" }}
          >
            {resource.location}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#11212D", color: "#4A5C6A" }}
          >
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold" style={{ color: "#9BA8AB" }}>
            {resource.capacity} Seats
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#11212D", color: "#4A5C6A" }}
          >
            <Tag className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold" style={{ color: "#9BA8AB" }}>
            {resource.resourceTypeDisplay || resource.type}
          </span>
        </div>
        {resource.availableFrom && (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#11212D", color: "#4A5C6A" }}
            >
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold" style={{ color: "#9BA8AB" }}>
              {resource.availabilityWindow || "Daily"}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {canEdit ? (
        <div
          className="flex items-center justify-end gap-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-transform"
          style={{ borderTop: "1px solid #4A5C6A" }}
        >
          <button
            onClick={() => onEdit(resource)}
            className="p-2 rounded-lg transition-all"
            style={{ color: "#4A5C6A" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#1c4f78";
              e.currentTarget.style.backgroundColor = "rgba(45, 112, 163, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#4A5C6A";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title="Edit Resource"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(resource.id)}
            className="p-2 rounded-lg transition-all"
            style={{ color: "#4A5C6A" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#4A5C6A";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title="Delete Resource"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="pt-4" style={{ borderTop: "1px solid #4A5C6A" }}>
          <button
            onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)}
            disabled={resource.status !== "ACTIVE"}
            className="w-full py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor:
                resource.status === "ACTIVE" ? "#1c4f78" : "#4A5C6A",
              color: "#CCD0CF",
            }}
            onMouseEnter={(e) => {
              if (resource.status === "ACTIVE") {
                e.currentTarget.style.backgroundColor = "#2d70a3";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                resource.status === "ACTIVE" ? "#1c4f78" : "#4A5C6A";
            }}
            title={
              resource.status !== "ACTIVE"
                ? "This resource is currently unavailable"
                : "Click to book this resource"
            }
          >
            <BookOpen className="w-4 h-4" />
            {resource.status === "ACTIVE" ? "Book Now" : "Unavailable"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResourceCard;
