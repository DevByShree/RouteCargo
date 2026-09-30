import { useState } from "react";

function Profile() {
    const [editing, setEditing] = useState(false);
    const [user, setUser] = useState({
        name: "Shree Joshi",
        email: "shree@example.com",
        phone: "9876543210",
        company: "RouteShare Logistics",
    });
    const [draft, setDraft] = useState(user);

    const handleChange = (e) => setDraft({ ...draft, [e.target.name]: e.target.value });

    const handleSave = () => {
        setUser(draft);
        setEditing(false);
    };

    const handleCancel = () => {
        setDraft(user);
        setEditing(false);
    };

    const fields = [
        { name: "name", label: "Full Name" },
        { name: "email", label: "Email" },
        { name: "phone", label: "Phone" },
        { name: "company", label: "Company" },
    ];
    return (
        <div className="px-10 mt-10 max-w-xl">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-gray-600 mb-6">Manage your personal details.</p>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center">
                        {user.name.split(" ").map((w) => w[0]).join("")}
                    </div>
                    <div>
                        <p className="font-semibold text-lg">{user.name}</p>
                        <p className="text-sm text-gray-500">Customer</p>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    {fields.map((f) => (
                        <div key={f.name}>
                            <label className="text-sm text-gray-500">{f.label}</label>
                            {editing ? (
                                <input
                                    name={f.name}
                                    value={draft[f.name]}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 mt-1"
                                />
                            ) : (
                                <p className="font-medium">{user[f.name]}</p>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex gap-3 mt-6">
                    {editing ? (
                        <>
                            <button onClick={handleSave} className="bg-blue-600 text-white px-5 py-2 rounded-lg">
                                Save
                            </button>
                            <button onClick={handleCancel} className="border px-5 py-2 rounded-lg">
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-5 py-2 rounded-lg">
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;