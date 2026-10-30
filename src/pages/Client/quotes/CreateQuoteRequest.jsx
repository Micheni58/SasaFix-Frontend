// src/pages/Client/quotes/CreateQuoteRequest.jsx

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft, X, Loader2, Send, MapPin, Lightbulb, UserCheck,
  UploadCloud, Calendar as CalendarIcon, Clock3, ZoomIn,
} from "lucide-react";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import { uploadImage } from "../../../api/uploadService";
import bookingRequestService from "../../../api/bookingRequestService";
import { useToast } from "../../../components/ui/ToastProvider";

const CATEGORIES = [
  "Plumbing", "Electrical", "Carpentry", "Cleaning",
  "Painting", "Gardening", "Moving & Delivery",
  "AC & Appliance Repair", "Security & CCTV", "Other",
];

const MAX_PHOTOS = 5;

const TIPS = [
  "Say what's wrong and where, e.g. \"leak under the kitchen sink\".",
  "Add clear photos. Providers quote faster and more accurately.",
  "Give a budget range so you only get quotes that fit.",
];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#056db3] focus:ring-4 focus:ring-blue-100";

const Card = ({ title, hint, children }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-gray-500">{hint}</p>}
    </div>
    <div className="space-y-5">{children}</div>
  </section>
);

const Field = ({ label, htmlFor, required, optional, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500" aria-hidden="true">*</span>}
      {optional && <span className="text-xs font-normal text-gray-400">Optional</span>}
    </label>
    {children}
  </div>
);

const CreateQuoteRequest = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const targetProviderId = searchParams.get("providerId");

  const [form, setForm] = useState({
    service_category: "",
    title: "",
    description: "",
    location: "",
    budget_min: "",
    budget_max: "",
    preferred_date: "",
    preferred_time_start: "",
    preferred_time_end: "",
  });

  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const updatePhoto = (preview, patch) =>
    setPhotos((prev) => prev.map((p) => (p.preview === preview ? { ...p, ...patch } : p)));

  const addFiles = async (fileList) => {
    const images = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    const room = MAX_PHOTOS - photos.length;

    if (!images.length) return;
    if (images.length > room) {
      toast.warning("Photo limit", `You can add up to ${MAX_PHOTOS} photos.`);
    }

    const accepted = images.slice(0, Math.max(room, 0)).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      url: null,
      uploading: true,
      error: null,
    }));
    if (!accepted.length) return;

    setPhotos((prev) => [...prev, ...accepted]);

    await Promise.all(
      accepted.map(async (photo) => {
        try {
          const url = await uploadImage(photo.file);
          updatePhoto(photo.preview, { url, uploading: false });
        } catch {
          updatePhoto(photo.preview, { uploading: false, error: "Upload failed" });
        }
      })
    );
  };

  const handlePhotoSelect = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removePhoto = (preview) => {
    URL.revokeObjectURL(preview);
    setPhotos((prev) => prev.filter((p) => p.preview !== preview));
  };

  const uploading = photos.some((p) => p.uploading);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.service_category) {
      toast.warning("Pick a category", "Choose the type of service you need.");
      return;
    }

    if (uploading) {
      toast.warning("Uploads in progress", "Please wait for photos to finish uploading.");
      return;
    }

    const min = form.budget_min ? parseFloat(form.budget_min) : null;
    const max = form.budget_max ? parseFloat(form.budget_max) : null;
    if (min !== null && max !== null && min > max) {
      toast.warning("Check your budget", "Minimum can't be higher than maximum.");
      return;
    }

    if (form.preferred_time_start && form.preferred_time_end && form.preferred_time_start >= form.preferred_time_end) {
      toast.warning("Check the time window", "End time must be later than start time.");
      return;
    }

    const validPhotos = photos.filter((p) => p.url).map((p) => p.url);

    setSubmitting(true);
    try {
      const payload = {
        service_category: form.service_category,
        title: form.title,
        description: form.description,
        location: form.location,
        budget_min: min,
        budget_max: max,
        photo_urls: validPhotos,
        target_provider_id: targetProviderId ? parseInt(targetProviderId, 10) : null,
        preferred_date: form.preferred_date || null,
        preferred_time_start: form.preferred_time_start ? `${form.preferred_time_start}:00` : null,
        preferred_time_end: form.preferred_time_end ? `${form.preferred_time_end}:00` : null,
      };

      const result = await bookingRequestService.createRequest(payload);
      toast.success("Request created", "Providers can now send you quotes.");
      navigate(`/client/quotes/${result.id}`);
    } catch (error) {
      toast.error("Failed to create request", error.response?.data?.detail || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="ml-0 min-w-0 flex-1 lg:ml-72">
        <Navbar />
        <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-20 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-[#056db3]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back
          </button>

          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Post a job</h1>
            <p className="mt-1.5 max-w-xl text-gray-500">
              Describe what you need and providers will send you quotes.
            </p>
          </header>

          {targetProviderId && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[#045a94]">
              <UserCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>This request will go only to the provider you selected.</p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* What you need */}
              <Card title="What do you need?" hint="Pick the closest category, then describe the job.">
                <Field label="Service category" required>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Service category">
                    {CATEGORIES.map((c) => {
                      const active = form.service_category === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setForm((f) => ({ ...f, service_category: c }))}
                          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                            active
                              ? "border-[#056db3] bg-[#056db3] text-white"
                              : "border-gray-200 bg-white text-gray-700 hover:border-[#056db3] hover:text-[#056db3]"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Job title" htmlFor="job-title" required>
                  <input
                    id="job-title"
                    required
                    type="text"
                    placeholder="e.g. Kitchen sink leaking"
                    value={form.title}
                    onChange={setField("title")}
                    className={inputClass}
                  />
                </Field>

                <Field label="Description" htmlFor="job-description" required>
                  <textarea
                    id="job-description"
                    required
                    rows={5}
                    placeholder="Describe the issue, what you've tried, and any special requirements"
                    value={form.description}
                    onChange={setField("description")}
                    className={`${inputClass} resize-y`}
                  />
                </Field>
              </Card>

              {/* When do you need it */}
              <Card title="When do you need it?" hint="Let providers know when you'd like the job done.">
                <Field label="Preferred date" htmlFor="preferred-date" optional>
                  <div className="relative">
                    <CalendarIcon
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      id="preferred-date"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={form.preferred_date}
                      onChange={setField("preferred_date")}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Time from" htmlFor="preferred-time-start" optional>
                    <div className="relative">
                      <Clock3
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        id="preferred-time-start"
                        type="time"
                        value={form.preferred_time_start}
                        onChange={setField("preferred_time_start")}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </Field>
                  <Field label="Time to" htmlFor="preferred-time-end" optional>
                    <div className="relative">
                      <Clock3
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        id="preferred-time-end"
                        type="time"
                        value={form.preferred_time_end}
                        onChange={setField("preferred_time_end")}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </Field>
                </div>
              </Card>

              {/* Where and how much */}
              <Card title="Where and how much?" hint="Providers use this to decide if they can take the job.">
                <Field label="Location" htmlFor="job-location" required>
                  <div className="relative">
                    <MapPin
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      id="job-location"
                      required
                      type="text"
                      placeholder="e.g. Westlands, Nairobi"
                      value={form.location}
                      onChange={setField("location")}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { name: "budget_min", label: "Budget min" },
                    { name: "budget_max", label: "Budget max" },
                  ].map(({ name, label }) => (
                    <Field key={name} label={label} htmlFor={name} optional>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                          KES
                        </span>
                        <input
                          id={name}
                          type="number"
                          inputMode="numeric"
                          min="0"
                          placeholder="0"
                          value={form[name]}
                          onChange={setField(name)}
                          className={`${inputClass} pl-14`}
                        />
                      </div>
                    </Field>
                  ))}
                </div>
              </Card>

              {/* Photos */}
              <Card title="Photos" hint={`Optional. Up to ${MAX_PHOTOS} images (JPEG, PNG, WebP).`}>
                {photos.length < MAX_PHOTOS && (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`dark-quote-photo-dropzone flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
                      dragging
                        ? "border-[#056db3] bg-blue-50"
                        : "border-gray-300 bg-gray-50/60 hover:border-[#056db3] hover:bg-blue-50"
                    }`}
                  >
                    <UploadCloud className="mb-2 h-7 w-7 text-[#056db3]" aria-hidden="true" />
                    <span className="text-sm font-medium text-gray-800">
                      Drag photos here or <span className="text-[#056db3]">browse</span>
                    </span>
                    <span className="dark-quote-photo-count mt-0.5 rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-gray-600">
                      {photos.length} of {MAX_PHOTOS} added
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={handlePhotoSelect}
                    />
                  </label>
                )}

                {photos.length > 0 && (
                  <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {photos.map((p) => (
                      <li
                        key={p.preview}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                      >
                        {/* Clickable preview image */}
                        <button
                          type="button"
                          onClick={() => setLightboxImage(p.preview)}
                          aria-label="Preview photo"
                          className="block h-full w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[#056db3] focus:ring-offset-1 rounded-xl"
                        >
                          <img
                            src={p.preview}
                            alt="Upload preview"
                            className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                          />

                          {/* Zoom icon hint, appears on hover */}
                          {!p.uploading && !p.error && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                              <ZoomIn className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </button>

                        {p.uploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                            <Loader2 className="h-5 w-5 animate-spin text-white" aria-label="Uploading" />
                          </div>
                        )}

                        {p.error && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-600/80 px-1 text-center text-xs font-medium text-white pointer-events-none">
                            {p.error}
                          </div>
                        )}

                        {/* Remove button, z-10 so it doesn't get blocked by the image button */}
                        <button
                          type="button"
                          onClick={() => removePhoto(p.preview)}
                          aria-label="Remove photo"
                          className="absolute right-1.5 top-1.5 z-10 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#056db3] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#045a94] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting...
                  </>
                ) : uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Uploading photos...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" aria-hidden="true" /> Post job and request quotes
                  </>
                )}
              </button>
            </form>

            <aside className="dark-quote-tips rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50">
                  <Lightbulb className="h-4 w-4 text-yellow-600" aria-hidden="true" />
                </span>
                <h2 className="text-sm font-semibold text-gray-900">Get better quotes</h2>
              </div>
              <ul className="space-y-3 text-sm leading-relaxed text-gray-600">
                {TIPS.map((tip) => (
                  <li key={tip} className="border-l-2 border-blue-100 pl-3">
                    {tip}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </main>
      </div>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Enlarged view"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default CreateQuoteRequest;