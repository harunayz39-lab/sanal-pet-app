import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Coffee, Droplets, Moon, Sparkles, Play, Gift, Settings, Star } from 'lucide-react';

const VirtualPetApp = () => {
  // Pet durumu
  const [pet, setPet] = useState({
    name: "Minnoş",
    type: "cat",
    level: 1,
    experience: 0,
    experienceToNext: 100,
    coins: 50,
    stats: {
      hunger: 80,
      thirst: 75,
      energy: 60,
      happiness: 85,
      cleanliness: 90,
      health: 95
    },
    mood: "happy",
    sleeping: false,
    lastUpdate: new Date().toISOString()
  });

  const [notifications, setNotifications] = useState([]);
  const [showShop, setShowShop] = useState(false);
  const [activities, setActivities] = useState([]);

  // Pet ruh hali belirleme
  const getPetMood = useCallback((stats) => {
    const avg = Object.values(stats).reduce((a, b) => a + b, 0) / Object.keys(stats).length;
    if (avg >= 80) return "happy";
    if (avg >= 60) return "content";
    if (avg >= 40) return "sad";
    return "critical";
  }, []);

  // Pet animasyon durumu
  const getPetAnimation = () => {
    if (pet.sleeping) return "😴";
    switch (pet.mood) {
      case "happy": return "😸";
      case "content": return "😺";
      case "sad": return "😿";
      case "critical": return "🙀";
      default: return "😺";
    }
  };

  // İstatistikleri güncelle
  const updateStats = useCallback(() => {
    setPet(prevPet => {
      const now = new Date();
      const lastUpdate = new Date(prevPet.lastUpdate);
      const minutesDiff = (now - lastUpdate) / (1000 * 60);
      
      if (minutesDiff < 1) return prevPet; // 1 dakikadan az ise güncelleme yapma

      const newStats = { ...prevPet.stats };
      
      if (!prevPet.sleeping) {
        newStats.hunger = Math.max(0, newStats.hunger - (minutesDiff * 0.5));
        newStats.thirst = Math.max(0, newStats.thirst - (minutesDiff * 0.7));
        newStats.energy = Math.max(0, newStats.energy - (minutesDiff * 0.3));
        newStats.cleanliness = Math.max(0, newStats.cleanliness - (minutesDiff * 0.2));
      } else {
        newStats.energy = Math.min(100, newStats.energy + (minutesDiff * 1.5));
      }

      // Sağlık durumu diğer istatistiklere bağlı
      const healthFactors = [newStats.hunger, newStats.thirst, newStats.cleanliness];
      const minHealth = Math.min(...healthFactors);
      newStats.health = Math.max(minHealth, newStats.health - (minutesDiff * 0.1));

      // Mutluluk durumu
      if (newStats.hunger < 30 || newStats.thirst < 30 || newStats.energy < 20) {
        newStats.happiness = Math.max(0, newStats.happiness - (minutesDiff * 0.8));
      }

      const mood = getPetMood(newStats);

      return {
        ...prevPet,
        stats: newStats,
        mood,
        lastUpdate: now.toISOString()
      };
    });
  }, [getPetMood]);

  // Bildirim ekle
  const addNotification = (message, type = "info") => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Aktivite ekle
  const addActivity = (action, result) => {
    const activity = {
      id: Date.now(),
      action,
      result,
      timestamp: new Date()
    };
    setActivities(prev => [activity, ...prev.slice(0, 9)]);
  };

  // Pet'i besle
  const feedPet = () => {
    if (pet.stats.hunger >= 95) {
      addNotification("Minnoş zaten tok!", "warning");
      return;
    }
    
    setPet(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        hunger: Math.min(100, prev.stats.hunger + 25),
        happiness: Math.min(100, prev.stats.happiness + 5)
      },
      experience: prev.experience + 10
    }));
    
    addNotification("Minnoş yemeğini çok sevdi! 😋", "success");
    addActivity("Besleme", "+25 Açlık, +5 Mutluluk");
  };

  // Pet'e su ver
  const giveDrink = () => {
    if (pet.stats.thirst >= 95) {
      addNotification("Minnoş zaten susuz değil!", "warning");
      return;
    }

    setPet(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        thirst: Math.min(100, prev.stats.thirst + 30),
        happiness: Math.min(100, prev.stats.happiness + 3)
      },
      experience: prev.experience + 8
    }));
    
    addNotification("Minnoş suyu içti! 💧", "success");
    addActivity("Su verme", "+30 Susuzluk, +3 Mutluluk");
  };

  // Pet ile oyna
  const playWithPet = () => {
    if (pet.stats.energy < 20) {
      addNotification("Minnoş çok yorgun, önce dinlenmesi gerek!", "warning");
      return;
    }

    setPet(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        energy: Math.max(0, prev.stats.energy - 15),
        happiness: Math.min(100, prev.stats.happiness + 20)
      },
      experience: prev.experience + 15,
      coins: prev.coins + 5
    }));
    
    addNotification("Minnoş oynamaya bayıldı! 🎾", "success");
    addActivity("Oyun", "+20 Mutluluk, -15 Enerji, +5 Coin");
  };

  // Pet'i uyut/uyandır
  const toggleSleep = () => {
    setPet(prev => ({
      ...prev,
      sleeping: !prev.sleeping,
      experience: prev.experience + 5
    }));
    
    if (!pet.sleeping) {
      addNotification("Minnoş uyumaya gitti... 😴", "info");
      addActivity("Uyku", "Dinleniyor");
    } else {
      addNotification("Minnoş uyandı! ☀️", "info");
      addActivity("Uyanma", "Dinlendi");
    }
  };

  // Pet'i temizle
  const cleanPet = () => {
    if (pet.stats.cleanliness >= 95) {
      addNotification("Minnoş zaten çok temiz!", "warning");
      return;
    }

    setPet(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        cleanliness: Math.min(100, prev.stats.cleanliness + 35),
        happiness: Math.min(100, prev.stats.happiness + 10),
        health: Math.min(100, prev.stats.health + 5)
      },
      experience: prev.experience + 12
    }));
    
    addNotification("Minnoş şimdi pırıl pırıl! ✨", "success");
    addActivity("Temizlik", "+35 Temizlik, +10 Mutluluk, +5 Sağlık");
  };

  // Seviye kontrolü
  useEffect(() => {
    if (pet.experience >= pet.experienceToNext) {
      setPet(prev => ({
        ...prev,
        level: prev.level + 1,
        experience: prev.experience - prev.experienceToNext,
        experienceToNext: prev.experienceToNext + 50,
        coins: prev.coins + 20
      }));
      addNotification(`🎉 Seviye atlandı! Seviye ${pet.level + 1}`, "success");
    }
  }, [pet.experience, pet.experienceToNext, pet.level]);

  // Otomatik güncelleme
  useEffect(() => {
    const interval = setInterval(updateStats, 60000); // Her dakika güncelle
    return () => clearInterval(interval);
  }, [updateStats]);

  // İlk yüklemede güncelle
  useEffect(() => {
    updateStats();
  }, [updateStats]);

  // İstatistik çubuğu bileşeni
  const StatBar = ({ label, value, color, icon: Icon }) => (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Icon size={16} className={`text-${color}-500`} />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-600">{Math.round(value)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        ></div>
      </div>
</div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{pet.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500" />
                Seviye {pet.level}
              </span>
              <span className="flex items-center gap-1">
                <Gift size={14} className="text-green-500" />
                {pet.coins} Coin
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowShop(!showShop)}
            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
        
        {/* XP Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Deneyim</span>
            <span>{pet.experience}/{pet.experienceToNext}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(pet.experience / pet.experienceToNext) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Pet Display */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 mb-6 text-center shadow-lg">
          <div className="text-8xl mb-4 animate-bounce">
            {getPetAnimation()}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{pet.name}</h2>
          <p className="text-gray-600 capitalize">
            {pet.sleeping ? "Uyuyor" : `Ruh Hali: ${pet.mood === "happy" ? "Mutlu" : 
              pet.mood === "content" ? "İyi" : 
              pet.mood === "sad" ? "Üzgün" : "Kötü"}`}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Stats Panel */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">İstatistikler</h3>
            
            <StatBar label="Açlık" value={pet.stats.hunger} color="red" icon={Coffee} />
            <StatBar label="Susuzluk" value={pet.stats.thirst} color="blue" icon={Droplets} />
            <StatBar label="Enerji" value={pet.stats.energy} color="green" icon={Moon} />
            <StatBar label="Mutluluk" value={pet.stats.happiness} color="yellow" icon={Heart} />
            <StatBar label="Temizlik" value={pet.stats.cleanliness} color="purple" icon={Sparkles} />
            <StatBar label="Sağlık" value={pet.stats.health} color="pink" icon={Heart} />
          </div>

          {/* Actions Panel */}
          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Aksiyonlar</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={feedPet}
                  disabled={pet.sleeping}
                  className="flex items-center justify-center gap-2 p-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Coffee size={18} />
                  Besle
                </button>
                
                <button
                  onClick={giveDrink}
                  disabled={pet.sleeping}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Droplets size={18} />
                  Su Ver
                </button>
                
                <button
                  onClick={playWithPet}
                  disabled={pet.sleeping || pet.stats.energy < 20}
                  className="flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Play size={18} />
                  Oyna
                </button>
                
                <button
                  onClick={cleanPet}
                  disabled={pet.sleeping}
                  className="flex items-center justify-center gap-2 p-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Sparkles size={18} />
                  Temizle
                </button>
              </div>
              
              <button
                onClick={toggleSleep}
                className="w-full mt-3 flex items-center justify-center gap-2 p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                <Moon size={18} />
                {pet.sleeping ? "Uyandır" : "Uyut"}
              </button>
            </div>

            {/* Notifications */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Bildirimler</h3>
              
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Henüz bildirim yok</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg text-sm ${
                        notification.type === "success" ? "bg-green-100 text-green-800" :
                        notification.type === "warning" ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {notification.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activities */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Son Aktiviteler</h3>
              
              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Henüz aktivite yok</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activities.map(activity => (
                    <div key={activity.id} className="p-2 bg-gray-100 rounded-lg text-sm">
                      <div className="font-medium text-gray-800">{activity.action}</div>
                      <div className="text-gray-600">{activity.result}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shop Modal */}
      {showShop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Mağaza</h2>
              <button
                onClick={() => setShowShop(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center py-8">
              <Gift size={48} className="mx-auto text-purple-500 mb-4" />
              <p className="text-gray-600">Mağaza özelliği yakında gelecek!</p>
              <p className="text-sm text-gray-500 mt-2">
                Özel yemekler, oyuncaklar ve aksesuarlar için beklemede kalın.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualPetApp;