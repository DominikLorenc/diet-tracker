import { AvatarCard } from "@/app/_components/profile/AvatarCard";

const stats = [
  {
    value: "1400",
    label: "kcal today",
    color: "text-brand-primary",
    bg: "bg-red-50",
  },
  {
    value: "7",
    label: "day streak",
    color: "text-macro-protein",
    bg: "bg-green-50",
  },
  {
    value: "142",
    label: "meals logged",
    color: "text-macro-carbs",
    bg: "bg-indigo-50",
  },
  {
    value: "3.2",
    label: "kg lost",
    color: "text-macro-fat",
    bg: "bg-yellow-50",
  },
];

const macros = [
  { name: "Carbs", percent: 50, grams: "250g", color: "bg-brand-primary" },
  { name: "Protein", percent: 30, grams: "150g", color: "bg-macro-protein" },
  { name: "Fat", percent: 20, grams: "44g", color: "bg-macro-fat" },
];

export default function Profile() {
  return (
    <div className="px-4 py-6 max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Profile</h1>
        <p className="text-sm text-text-secondary">
          Manage your account and goals
        </p>
      </div>

      {/* Główny layout: 1 kolumna mobile, 2 kolumny desktop */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Lewa kolumna — avatar + stats */}
        <div className="flex flex-col gap-4 w-full lg:w-72 shrink-0">
          <div className="bg-surface rounded-2xl shadow-sm">
            <AvatarCard name="Dominik" email="dominik@example.com" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-3">
              Quick Stats
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className={`${stat.bg} rounded-2xl p-4`}>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prawa kolumna — formularz + cele */}
        <div className="flex flex-col gap-4 flex-1 w-full">
          {/* Personal Information */}
          <div className="bg-surface rounded-2xl shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary">
                Personal Information
              </h2>
              <button className="text-xs text-brand-primary flex items-center gap-1">
                ✏️ Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-secondary">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue="Dominik"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-secondary">Last Name</label>
                <input
                  type="text"
                  defaultValue="Kowalski"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-secondary">Email</label>
                <input
                  type="email"
                  defaultValue="dominik@example.com"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-secondary">Age</label>
                <input
                  type="number"
                  defaultValue={24}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-secondary">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  defaultValue={82}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-secondary">
                  Height (kg)
                </label>
                <input
                  type="number"
                  defaultValue={78}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button className="bg-brand-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                Update Profile
              </button>
            </div>
          </div>

          {/* Caloric & Macro Goals */}
          <div className="bg-surface rounded-2xl shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary">
                Caloric &amp; Macro Goals
              </h2>
              <span className="text-xs text-brand-primary border border-brand-primary rounded-full px-2 py-0.5">
                Save
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                Daily Calorie Goal
              </span>
              <span className="text-sm font-semibold text-text-primary">
                1000 kcal
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                defaultValue={2000}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              />
              <span className="bg-brand-primary text-white text-sm font-medium px-4 py-2.5 rounded-xl">
                kcal
              </span>
            </div>

            <h3 className="text-sm font-medium text-text-primary">
              Macro Distribution
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {macros.map((macro) => (
                <div
                  key={macro.name}
                  className="flex flex-col gap-2 border border-gray-100 rounded-xl p-3"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-text-primary">
                      {macro.name}
                    </span>
                    <span className="text-text-muted">{macro.percent}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div
                      className={`h-full rounded-full ${macro.color}`}
                      style={{ width: `${macro.percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-text-primary">
                    {macro.grams}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button className="border border-gray-200 text-sm text-text-secondary px-5 py-2.5 rounded-xl hover:bg-surface-muted transition-colors">
                Cancel
              </button>
              <button className="bg-brand-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
