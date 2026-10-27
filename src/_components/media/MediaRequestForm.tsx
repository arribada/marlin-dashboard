'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Calendar, Clock, FileText, Edit2, CheckCircle2, AlertCircle, Clapperboard, Headphones, X } from "lucide-react";
import { addMinutes, format } from "date-fns";
import { Checkbox } from "../ui/checkbox";
import { TripDetails } from "@/_types/trip";
import { cn } from "../ui/utils";
import { formatDateThenTime, formatDuration, formatTimeThenDate } from "@/_utils/formatting";
import { Badge } from "../ui/badge";

interface MediaRequestFormProps {
  initialStart?: Date;
  trip: TripDetails;
  onSubmit?: (
    startTime: Date,
    endTime: Date,
    types: ('video' | 'audio' | 'transcript')[]
  ) => void;
  onClose: () => void;
}

export function MediaRequestForm({
  initialStart,
  trip,
  onSubmit,
  onClose
}: MediaRequestFormProps) {

  const [startDateTime, setStartDateTime] =
    useState(initialStart ? format(initialStart, "yyyy-MM-dd'T'HH:mm:ss") : format(trip.start, "yyyy-MM-dd'T'HH:mm:ss"));
  const [endDateTime, setEndDateTime] =
  useState(format(addMinutes(initialStart ?? trip.start, 20), "yyyy-MM-dd'T'HH:mm:ss"));
  // Re-sync start when the parent passes a new clicked time
  useEffect(() => {
    if (initialStart) setStartDateTime(format(initialStart, "yyyy-MM-dd'T'HH:mm:ss"));
  }, [initialStart?.getTime()]);

  const [includeVideo, setIncludeVideo] = useState(true);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [includeTranscript, setIncludeTranscript] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const mediaOptions = [
    { id: "video", label: "Video", icon: Clapperboard, checked: includeVideo, onChange: setIncludeVideo },
    { id: "audio", label: "Audio", icon: Headphones, checked: includeAudio, onChange: setIncludeAudio },
    { id: "transcript", label: "Transcript", icon: FileText, checked: includeTranscript, onChange: setIncludeTranscript },
  ];

  // --- Validation ---
  const noMediaSelected = !includeVideo && !includeAudio && !includeTranscript;
  const durationMs = new Date(endDateTime).getTime() - new Date(startDateTime).getTime();
  const durationMinutes = durationMs / (1000 * 60);
  const durationExceeds20 = durationMinutes > 20;
  const durationInvalid = durationMinutes <= 0;

  const validationErrors: { field: 'media' | 'end' | null; message: string }[] = [];
  if (noMediaSelected) validationErrors.push({ field: 'media', message: 'Please select at least one media type.' });
  if (durationInvalid) validationErrors.push({ field: 'end', message: 'End time must be after start time.' });
  if (durationExceeds20) validationErrors.push({ field: 'end', message: 'Duration cannot exceed 20 minutes.' });

  const isValid = validationErrors.length === 0;

  const hasFieldError = (field: 'media' | 'end') =>
    submitAttempted && validationErrors.some((e) => e.field === field);

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (!isValid) return;
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const types = [
      includeVideo && 'video',
      includeAudio && 'audio',
      includeTranscript && 'transcript',
    ].filter(Boolean) as ('video' | 'audio' | 'transcript')[];
    setIsSubmitted(true);
    onSubmit?.(start, end, types);
  };

  const handleEdit = () => {
    setIsSubmitted(false);
    setSubmitAttempted(false);
  };

  // Summary Banner View (post-submission)
  if (isSubmitted) {
    return (
      <Card
        className="w-full bg-gradient-to-br from-sea-green/5 to-sea-green/10 border-sea-green/20 cursor-pointer mb-6"
        onClick={handleEdit}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4">

              <div className="flex items-center gap-2 group">
                <CheckCircle2 className="h-5 w-5 text-sea-green flex-shrink-0 mt-1" />
                <h2 className="text-ocean-blue font-normal">Media Request Submitted</h2>
                <span className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to edit
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 ml-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {formatTimeThenDate(startDateTime)}
                    {formatTimeThenDate(startDateTime) !== formatTimeThenDate(endDateTime) &&
                      ` - ${formatTimeThenDate(endDateTime)}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{formatDuration(startDateTime, endDateTime)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground ml-6">
                <span>Media:</span>
                <div className="flex items-center gap-2">
                  {mediaOptions.filter(({ checked }) => checked).map(({ label, icon: Icon }) => (
                    <Badge key={label} >
                      <Icon className="h-3 w-3 mr-1" />
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              className="text-ocean-blue"
              data-testid="edit-button"
              onClick={(e) => { e.stopPropagation(); handleEdit(); }}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Form View (pre-submission)
  return (
    <Card className="w-full md:w-1/2 mb-6">
      <CardHeader className="border-b">
          <div className="flex justify-between">
            <div className="flex items-center gap-3 mb-2">
              <Edit2 className="h-5 w-5 text-ocean-blue" />
              <h2 className="text-ocean-blue">Media Request Form</h2>
            </div>
            <X className="h-5 w-5 text-ocean-blue" onClick={onClose} data-testid="close"/>
          </div>
          <div className="text-muted-foreground">
            Specify start and end times for media retrieval
          </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date/Time */}
          <div className="space-y-3">
            <label htmlFor="start" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Start
            </label>
            <Input
              id="start"
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              min={format(trip.start, "yyyy-MM-dd'T'HH:mm:ss")}
              max={format(trip.end, "yyyy-MM-dd'T'HH:mm:ss")}
              className="bg-input-background text-sm"
            />
          </div>

          {/* End Date/Time */}
          <div className="space-y-3">
            <label htmlFor="end" className={cn("flex items-center gap-1", hasFieldError('end') && "text-destructive")}>
              <Calendar className="h-3 w-3" />
              End
            </label>
            <Input
              id="end"
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              min={format(trip.start, "yyyy-MM-dd'T'HH:mm:ss")}
              max={format(trip.end, "yyyy-MM-dd'T'HH:mm:ss")}
              className={cn(
                "bg-input-background text-sm",
                hasFieldError('end') && "border-destructive focus-visible:ring-destructive"
              )}
            />
          </div>
        </div>

        {/* Media Type Selection */}
        <div className="space-y-3 py-4">
          <label className={cn("text-muted-foreground", hasFieldError('media') && "text-destructive")}>
            Media to Request
          </label>
          <div className={cn("space-y-2 mt-2 rounded-md p-2 -mx-2", hasFieldError('media') && "ring-1 ring-destructive")}>
            {mediaOptions.map(({ id, label, icon: Icon, checked, onChange }) => (
              <div key={id} className="flex items-center space-x-2">
                <Checkbox
                  id={`include-${id}`}
                  checked={checked}
                  onCheckedChange={(checked) => onChange(checked as boolean)}
                />
                <label htmlFor={`include-${id}`} className="flex items-center gap-2 cursor-pointer">
                  <Icon className="h-4 w-4 text-ocean-blue" />
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Request Preview */}
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <p className="text-muted-foreground mb-4">Request Preview:</p>
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Media:</span>
                <span className={cn("text-ocean-blue", hasFieldError('media') && "text-destructive")}>
                  {noMediaSelected
                    ? <span className="italic text-destructive">None selected</span>
                    : mediaOptions.filter(({ checked }) => checked).map(({ label }) => label).join(", ")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Start:</span>
                <span className="text-ocean-blue">{formatDateThenTime(startDateTime)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className={cn("text-ocean-blue", (hasFieldError('end')) && "text-destructive")}>
                  {formatDuration(startDateTime, endDateTime)}
                </span>
              </div>

              {/* Validation error messages */}
              {submitAttempted && validationErrors.length > 0 && (
                <div className="pt-2 space-y-1">
                  {validationErrors.map((err, i) => (
                    <p key={i} className="text-destructive text-sm flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      {err.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          className={cn(
            "w-full",
            isValid || !submitAttempted
              ? "bg-ocean-blue hover:bg-ocean-blue-light"
              : "bg-ocean-blue/50 cursor-not-allowed"
          )}
          onClick={handleSubmit}
        >
          Submit Media Request
        </Button>
      </CardContent>
    </Card>
  );
}
