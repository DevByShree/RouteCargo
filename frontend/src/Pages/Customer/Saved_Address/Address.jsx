
function Address() {
    const [activeTab, setActiveTab] = useState("all");

    const tabs = [
        { id: "all", label: "All Addresses", count: 6 },
        { id: "pickup", label: "Pickup Addresses", count: 3 },
        { id: "delivery", label: "Delivery Addresses", count: 3 },
    ];

    return (
        <div>
            <div className="mt-10 px-10 flex flex-col gap-2">
                <span className="font-semibold"> Saved Address </span>
                <span className="font-bold text-3xl">Your Saved Addressess</span>
                <span className="font-light">Manage your frequently used pickup and delivery locations</span>
            </div>
            <div>
                {tabs.map((tab) => {
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg ${activeTab === (tab.id)}
                            
                            `}
                    ></button>
                })}
            </div>
        </div>
    )
}

export default Address