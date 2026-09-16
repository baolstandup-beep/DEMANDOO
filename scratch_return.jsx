  return (
    <TripCreationLayout 
      step={step} 
      totalSteps={totalSteps} 
      onBack={() => step > 1 ? setStep(step - 1) : navigate('/espace-chauffeur')}
      errorMsg={errorMsg}
    >
      
      {/* STEP 1: ITINÉRAIRE */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <StepHeader 
            icon={Navigation} 
            title="Quel est votre itinéraire ?" 
            description="Indiquez votre ville de départ et votre destination." 
          />

          <div className="space-y-5 relative mt-8">
            <div className="absolute left-[23px] top-[40px] bottom-[40px] w-[2px] bg-[#E4EBE8] z-0" />

            <div className="relative z-10">
              <FormField label="Ville de départ" required>
                <div className="relative group">
                  <div className="absolute left-[19px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-[2.5px] border-[#101828] bg-white z-10 group-focus-within:border-demandoo-600 transition-colors" />
                  <input
                    type="text"
                    list="cities-list-pub"
                    value={departureCity}
                    onChange={(e) => {
                      const clean = extractCityName(e.target.value);
                      setDepartureCity(clean);
                      const sug = getSuggestedPrice(clean, arrivalCity);
                      setPricePerSeat(sug.default);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Ex: Touba"
                    className="w-full h-[60px] pl-[48px] pr-4 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-base font-bold text-[#101828] focus:border-demandoo-500 focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] transition-all outline-none"
                  />
                </div>
                {/* Suggestions */}
                <div className="flex flex-wrap gap-2 mt-2 ml-[48px]">
                  {["Touba", "Dakar", "Thiès", "Saint-Louis", "Mbour", "Kaolack"].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setDepartureCity(c);
                        const sug = getSuggestedPrice(c, arrivalCity);
                        setPricePerSeat(sug.default);
                        if (errorMsg) setErrorMsg('');
                      }}
                      className={`px-3 py-1.5 rounded-[8px] text-[13px] font-bold transition-all ${departureCity === c ? 'bg-[#101828] text-white' : 'bg-[#F7FAF9] text-[#667085] hover:bg-[#EFF9F6] hover:text-demandoo-700'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            {/* WAYPOINTS */}
            {waypoints.map((wp, idx) => (
              <div key={idx} className="relative z-10 ml-[48px]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] font-bold text-[#667085] uppercase">
                    Arrêt {idx + 1}
                  </label>
                  <button
                    type="button"
                    onClick={() => removeWaypoint(idx)}
                    className="text-[12px] font-bold text-[#F04438] hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute -left-[29.5px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-[#667085] z-10 border-2 border-white" />
                  <input
                    type="text"
                    list="cities-list-pub"
                    value={wp}
                    onChange={(e) => updateWaypoint(idx, e.target.value)}
                    placeholder="Ex: Thiès"
                    className="w-full h-[56px] px-4 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-sm font-bold text-[#101828] focus:border-demandoo-500 transition-all outline-none"
                  />
                </div>
              </div>
            ))}

            {waypoints.length < 3 && (
              <div className="relative z-10 ml-[48px]">
                <button
                  type="button"
                  onClick={addWaypoint}
                  className="inline-flex items-center gap-2 text-[13px] font-bold text-[#667085] hover:text-[#101828] py-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un arrêt
                </button>
              </div>
            )}

            <div className="relative z-10">
              <FormField label="Ville d'arrivée" required>
                <div className="relative group">
                  <MapPin className="absolute left-[16px] top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500 z-10" />
                  <input
                    type="text"
                    list="cities-list-pub"
                    value={arrivalCity}
                    onChange={(e) => {
                      const clean = extractCityName(e.target.value);
                      setArrivalCity(clean);
                      const sug = getSuggestedPrice(departureCity, clean);
                      setPricePerSeat(sug.default);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Ex: Dakar"
                    className="w-full h-[60px] pl-[48px] pr-4 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-base font-bold text-[#101828] focus:border-demandoo-500 focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] transition-all outline-none"
                  />
                </div>
                {/* Suggestions */}
                <div className="flex flex-wrap gap-2 mt-2 ml-[48px]">
                  {["Dakar", "Touba", "Thiès", "Saint-Louis", "Mbour", "Kaolack"].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setArrivalCity(c);
                        const sug = getSuggestedPrice(departureCity, c);
                        setPricePerSeat(sug.default);
                        if (errorMsg) setErrorMsg('');
                      }}
                      className={`px-3 py-1.5 rounded-[8px] text-[13px] font-bold transition-all ${arrivalCity === c ? 'bg-[#101828] text-white' : 'bg-[#F7FAF9] text-[#667085] hover:bg-[#EFF9F6] hover:text-demandoo-700'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            <datalist id="cities-list-pub">
              {INITIAL_CITIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <PrimaryButton 
            onClick={() => {
              if (!departureCity.trim()) { setErrorMsg("Veuillez renseigner votre ville de départ."); return; }
              if (!arrivalCity.trim()) { setErrorMsg("Veuillez renseigner votre ville d'arrivée."); return; }
              if (departureCity.trim().toLowerCase() === arrivalCity.trim().toLowerCase()) { setErrorMsg("La ville de départ et d'arrivée ne peuvent pas être identiques."); return; }
              setErrorMsg(''); setStep(2);
            }}
            disabled={!departureCity || !arrivalCity}
          >
            Continuer <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      )}

      {/* STEP 2: DATE & TIME */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <StepHeader 
            icon={Calendar} 
            title="Quand partez-vous ?" 
            description="Indiquez la date et l'heure prévues de votre départ." 
          />

          <div className="space-y-6 mt-8">
            <FormField label="Date du départ" required>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => { setDate(e.target.value); if (errorMsg) setErrorMsg(''); }}
                className="w-full h-[60px] px-5 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-base font-bold text-[#101828] focus:border-demandoo-500 focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] transition-all outline-none"
                required
              />
            </FormField>

            <FormField label="Heure de départ" required>
              <input
                type="time"
                value={time}
                onChange={(e) => { setTime(e.target.value); if (errorMsg) setErrorMsg(''); }}
                className="w-full h-[60px] px-5 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-base font-bold text-[#101828] focus:border-demandoo-500 focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] transition-all outline-none"
                required
              />
            </FormField>
          </div>

          <PrimaryButton 
            onClick={() => {
              if (!date) { setErrorMsg("Veuillez sélectionner la date du trajet."); return; }
              if (!time) { setErrorMsg("Veuillez sélectionner l'heure du trajet."); return; }
              setErrorMsg(''); setStep(3);
            }}
            disabled={!date || !time}
          >
            Continuer <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      )}

      {/* STEP 3: EXACT PICKUP & DROP OFF ADDRESSES */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <StepHeader 
            icon={MapPin} 
            title="Où retrouver vos passagers ?" 
            description="Soyez précis pour faciliter la rencontre." 
          />

          <div className="space-y-6 mt-8">
            <FormField label={`Point de départ à ${departureCity || 'départ'}`} required>
              <input
                type="text"
                value={departureAddress}
                onChange={(e) => { setDepartureAddress(e.target.value); if (errorMsg) setErrorMsg(''); }}
                placeholder="Ex: Gare Routière de Touba"
                className="w-full h-[60px] px-5 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-base font-bold text-[#101828] focus:border-demandoo-500 focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] transition-all outline-none"
                required
              />
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[12px] font-bold text-[#667085] self-center">Suggestions:</span>
                {["Gare Routière", "Centre-ville", "Station Total", "Grande Mosquée"].map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => { setDepartureAddress(`${loc}${departureCity ? ' de ' + departureCity : ''}`); if (errorMsg) setErrorMsg(''); }}
                    className="px-3 py-1.5 rounded-[8px] bg-[#F7FAF9] hover:bg-[#EFF9F6] text-[#667085] hover:text-demandoo-700 text-[12px] font-bold transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label={`Point d'arrivée à ${arrivalCity || 'arrivée'}`}>
              <input
                type="text"
                value={arrivalAddress}
                onChange={(e) => setArrivalAddress(e.target.value)}
                placeholder="Ex: Gare des Baux Maraîchers"
                className="w-full h-[60px] px-5 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-base font-bold text-[#101828] focus:border-demandoo-500 focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] transition-all outline-none"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[12px] font-bold text-[#667085] self-center">Suggestions:</span>
                {["Gare des Baux Maraîchers", "Rond-point Liberté 6", "Centre-ville", "Gare Routière"].map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setArrivalAddress(loc)}
                    className="px-3 py-1.5 rounded-[8px] bg-[#F7FAF9] hover:bg-[#EFF9F6] text-[#667085] hover:text-demandoo-700 text-[12px] font-bold transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          <PrimaryButton 
            onClick={() => {
              if (!departureAddress || !departureAddress.trim()) { setErrorMsg(`Le point de départ à ${departureCity} est obligatoire.`); return; }
              setErrorMsg(''); setStep(4);
            }}
          >
            Continuer <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      )}

      {/* STEP 4: VEHICLE INFO */}
      {step === 4 && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <StepHeader 
            icon={Car} 
            title="Votre véhicule" 
            description="Les passagers aiment savoir dans quelle voiture ils voyageront." 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
            <FormField label="Marque">
              <input
                type="text"
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                className="w-full h-[56px] px-4 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-sm font-bold text-[#101828] focus:border-demandoo-500 transition-all outline-none"
              />
            </FormField>
            <FormField label="Modèle">
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full h-[56px] px-4 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-sm font-bold text-[#101828] focus:border-demandoo-500 transition-all outline-none"
              />
            </FormField>
            <FormField label="Couleur">
              <input
                type="text"
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
                className="w-full h-[56px] px-4 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-sm font-bold text-[#101828] focus:border-demandoo-500 transition-all outline-none"
              />
            </FormField>
            <FormField label="Immatriculation">
              <input
                type="text"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="w-full h-[56px] px-4 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-sm font-bold text-[#101828] focus:border-demandoo-500 transition-all outline-none"
              />
            </FormField>
          </div>

          <PrimaryButton onClick={() => setStep(5)}>
            Continuer <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      )}

      {/* STEP 5: NUMBER OF SEATS */}
      {step === 5 && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <StepHeader 
            icon={Users} 
            title="Combien de places proposez-vous ?" 
            description="Indiquez uniquement les places réellement disponibles pour les passagers." 
          />

          <div className="flex flex-col items-center justify-center py-10 mt-4">
            <div className="flex items-center justify-center gap-8">
              <button
                type="button"
                onClick={() => seatsTotal > 1 && setSeatsTotal(seatsTotal - 1)}
                className="w-[60px] h-[60px] rounded-[16px] bg-[#F7FAF9] border border-[#E4EBE8] flex items-center justify-center text-3xl font-black text-[#667085] hover:border-demandoo-500 hover:text-demandoo-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={seatsTotal <= 1}
              >
                −
              </button>
              
              <div className="text-center w-32">
                <span className="text-[64px] leading-none font-black text-[#101828] block">{seatsTotal}</span>
                <span className="text-[13px] font-bold text-[#667085] mt-2 block">places disponibles</span>
              </div>
              
              <button
                type="button"
                onClick={() => seatsTotal < 4 && setSeatsTotal(seatsTotal + 1)}
                className="w-[60px] h-[60px] rounded-[16px] bg-[#F7FAF9] border border-[#E4EBE8] flex items-center justify-center text-3xl font-black text-[#667085] hover:border-demandoo-500 hover:text-demandoo-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={seatsTotal >= 4}
              >
                +
              </button>
            </div>
          </div>

          <PrimaryButton onClick={() => setStep(6)}>
            Continuer <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      )}

      {/* STEP 6: PRICE PER SEAT */}
      {step === 6 && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <StepHeader 
            icon={DollarSign} 
            title="Quel est le prix par passager ?" 
            description="Indiquez le montant demandé pour une place. Le paiement se fera directement entre vous et les passagers." 
          />

          <div className="space-y-6 mt-8">
            <div className="relative flex flex-col items-center">
              <label className="text-[13px] font-bold text-[#667085] uppercase tracking-wider mb-4">PRIX PAR PASSAGER</label>
              <div className="relative w-full max-w-[400px]">
                <input
                  type="number"
                  min={500}
                  step={500}
                  value={pricePerSeat}
                  onChange={(e) => { setPricePerSeat(parseInt(e.target.value, 10)); if(errorMsg) setErrorMsg(''); }}
                  className="w-full text-center py-6 rounded-[20px] bg-[#F7FAF9] border-2 border-[#DCE5E2] text-4xl font-black text-[#101828] focus:bg-[#FFFFFF] focus:border-demandoo-500 focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] transition-all outline-none"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black text-[#667085]">FCFA</span>
              </div>
              
              {/* Total indicator */}
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#EFF9F6] rounded-full border border-demandoo-100">
                <span className="text-[13px] font-bold text-demandoo-800">Soit un total de :</span>
                <span className="text-[14px] font-black text-demandoo-700">{(pricePerSeat * seatsTotal).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
            
            <div className="p-4 bg-[#F7FAF9] rounded-[16px] flex items-start gap-3">
              <div className="text-xl">💡</div>
              <p className="text-[13px] text-[#667085] font-medium leading-relaxed">
                Prix conseillé pour le trajet <strong>{departureCity || 'Départ'} ➔ {arrivalCity || 'Arrivée'}</strong> : <strong className="font-bold text-[#101828]">{getSuggestedPrice(departureCity, arrivalCity).min.toLocaleString('fr-FR')} - {getSuggestedPrice(departureCity, arrivalCity).max.toLocaleString('fr-FR')} FCFA</strong>. Demandoo ne prend aucune commission sur ce montant.
              </p>
            </div>
          </div>

          <PrimaryButton 
            onClick={() => {
              if (!pricePerSeat || pricePerSeat < 500) { setErrorMsg("Le prix par place doit être d'au moins 500 FCFA."); return; }
              setErrorMsg(''); setStep(7);
            }}
          >
            Continuer <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      )}

      {/* STEP 7: RULES & AMENITIES */}
      {step === 7 && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <StepHeader 
            icon={CheckCircle} 
            title="Informations du trajet" 
            description="Quelques options supplémentaires pour vos passagers." 
          />

          <div className="space-y-6 mt-8">
            <FormField label="Bagages acceptés">
              <select
                value={rulesLuggage}
                onChange={(e) => setRulesLuggage(e.target.value)}
                className="w-full h-[60px] px-5 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-base font-bold text-[#101828] focus:border-demandoo-500 transition-all outline-none appearance-none"
              >
                <option value="Sacs de taille moyenne autorisés">Moyen (Sacs de voyage)</option>
                <option value="Grands bagages autorisés">Grand (Valises en soute)</option>
                <option value="Petits bagages uniquement">Petit (Sacs à dos uniquement)</option>
              </select>
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`cursor-pointer flex items-center p-5 rounded-[16px] border-2 transition-all gap-4 ${rulesSmoking ? 'border-demandoo-500 bg-[#EFF9F6]' : 'border-[#E4EBE8] bg-[#FFFFFF] hover:border-[#DCE5E2]'}`}>
                <input type="checkbox" checked={rulesSmoking} onChange={(e) => setRulesSmoking(e.target.checked)} className="sr-only" />
                <span className="text-3xl">🚬</span>
                <div>
                  <span className={`block font-black text-sm ${rulesSmoking ? 'text-demandoo-800' : 'text-[#101828]'}`}>Fumeur autorisé</span>
                  <span className={`text-[12px] font-medium ${rulesSmoking ? 'text-demandoo-700' : 'text-[#667085]'}`}>Pendant le trajet</span>
                </div>
              </label>

              <label className={`cursor-pointer flex items-center p-5 rounded-[16px] border-2 transition-all gap-4 ${rulesPets ? 'border-demandoo-500 bg-[#EFF9F6]' : 'border-[#E4EBE8] bg-[#FFFFFF] hover:border-[#DCE5E2]'}`}>
                <input type="checkbox" checked={rulesPets} onChange={(e) => setRulesPets(e.target.checked)} className="sr-only" />
                <span className="text-3xl">🐾</span>
                <div>
                  <span className={`block font-black text-sm ${rulesPets ? 'text-demandoo-800' : 'text-[#101828]'}`}>Animaux acceptés</span>
                  <span className={`text-[12px] font-medium ${rulesPets ? 'text-demandoo-700' : 'text-[#667085]'}`}>Avec accord préalable</span>
                </div>
              </label>
            </div>
          </div>

          <PrimaryButton onClick={() => setStep(8)}>
            Vérifier le récapitulatif <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      )}

      {/* STEP 8: RECAP & CONFIRM PUBLISH */}
      {step === 8 && (
        <form onSubmit={handleFinalSubmit} className="space-y-6 animate-fade-in relative z-10">
          <div className="space-y-2 text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#101828] tracking-tight">
              Vérifiez votre trajet
            </h2>
            <p className="text-[#667085] font-medium text-sm">
              Assurez-vous que toutes les informations sont correctes.
            </p>
          </div>

          <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E4EBE8] overflow-hidden">
            {/* Itinerary Banner */}
            <div className="bg-[#F7FAF9] p-6 text-center border-b border-[#E4EBE8]">
              <div className="flex flex-wrap items-center justify-center gap-3 text-2xl sm:text-3xl font-black text-[#101828]">
                <span>{departureCity}</span>
                <ArrowRight className="w-6 h-6 text-[#DCE5E2] shrink-0" />
                <span>{arrivalCity}</span>
              </div>
              <div className="mt-2 text-sm font-bold text-[#667085] uppercase tracking-wider">
                {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {time}
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between py-3 border-b border-[#F0F2F1]">
                <span className="text-[#667085] font-bold text-[13px] uppercase">Point de rencontre</span>
                <div className="text-right">
                  <span className="font-bold text-[#101828] text-[14px]">{departureAddress}</span>
                  <button type="button" onClick={() => setStep(3)} className="block ml-auto mt-1 text-[12px] font-bold text-demandoo-600 hover:underline">Modifier</button>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#F0F2F1]">
                <span className="text-[#667085] font-bold text-[13px] uppercase">Places</span>
                <div className="text-right">
                  <span className="font-bold text-[#101828] text-[14px]">{seatsTotal} places</span>
                  <button type="button" onClick={() => setStep(5)} className="block ml-auto mt-1 text-[12px] font-bold text-demandoo-600 hover:underline">Modifier</button>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#F0F2F1]">
                <span className="text-[#667085] font-bold text-[13px] uppercase">Prix</span>
                <div className="text-right">
                  <span className="font-black text-[#101828] text-[16px]">{pricePerSeat.toLocaleString('fr-FR')} FCFA <span className="text-[12px] font-medium text-[#667085]">/ passager</span></span>
                  <button type="button" onClick={() => setStep(6)} className="block ml-auto mt-1 text-[12px] font-bold text-demandoo-600 hover:underline">Modifier</button>
                </div>
              </div>

               <div className="flex items-center justify-between py-3">
                <span className="text-[#667085] font-bold text-[13px] uppercase">Véhicule</span>
                <div className="text-right">
                  <span className="font-bold text-[#101828] text-[14px]">{vehicleMake} {vehicleModel}</span>
                  <button type="button" onClick={() => setStep(4)} className="block ml-auto mt-1 text-[12px] font-bold text-demandoo-600 hover:underline">Modifier</button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <PrimaryButton 
              type="submit"
              disabled={isPublishing || isSuccess}
            >
              {isSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Trajet publié ! Redirection...</span>
                </>
              ) : isPublishing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publication en cours...</span>
                </>
              ) : (
                <span>Publier le trajet</span>
              )}
            </PrimaryButton>
            <p className="text-center text-[12px] font-medium text-[#667085] mt-4">
              En publiant ce trajet, il deviendra visible par les passagers sur Demandoo.
            </p>
          </div>
        </form>
      )}
    </TripCreationLayout>
  );
