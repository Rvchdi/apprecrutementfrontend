import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight,
  Briefcase,
  Building2,
  Phone,
  User,
  Info,
  MapPin,
  Globe
} from 'lucide-react';
import registrationImage from '../assets/RegisterCompany.png'; // Assurez-vous d'avoir cette image

const CompanyRegistration = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    website: '',
    address: '',
    zipCode: '',
    city: '',
    contactFirstName: '',
    contactLastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Registration logic
    console.log('Company Registration', formData);
  };

  const redirectToLogin = () => {
    // Redirect to login page
    window.location.href = '/login';
  };

  // List of industries for select
  const industries = [
    "Technologie",
    "Finance",
    "Santé",
    "Éducation",
    "Commerce de détail",
    "Industrie manufacturière",
    "Services professionnels",
    "Transport et logistique",
    "Médias et Communication",
    "Construction",
    "Autre"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 text-gray-800 sticky top-0 z-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold flex items-center text-teal-600 transition-transform hover:scale-105 duration-300">
            <Briefcase className="mr-2" size={32} />
            Testing
          </div>
          <nav className="space-x-6">
            <a href="#" className="hover:text-teal-500 transition-colors duration-300">Accueil</a>
            <a href="#" className="hover:text-teal-500 transition-colors duration-300">Offres</a>
            <a href="#" className="hover:text-teal-500 transition-colors duration-300">À propos</a>
          </nav>
        </div>
      </header>

      <div className="flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Side - Illustration (Mobile: Top) */}
          <div className="w-full md:w-5/12 relative bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center order-1 md:order-none">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-90 z-10"></div>
            
            {/* Illustration Content */}
            <div className="relative z-20 w-full h-full p-6">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-full max-w-[300px] transform hover:scale-105 transition-transform duration-500">
                  <img src={registrationImage} alt="Registration Illustration" className="w-full drop-shadow-xl" />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-semibold text-white">Espace Entreprise</h3>
                  <p className="text-blue-100 mt-2 text-sm">Créez votre compte entreprise pour accéder à toutes nos fonctionnalités exclusives</p>
                  <div className="mt-8">
                    <ul className="space-y-2">
                      <li className="flex items-center text-blue-100">
                        <div className="bg-blue-400 bg-opacity-20 p-1 rounded-full mr-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        Publiez des offres d'emploi
                      </li>
                      <li className="flex items-center text-blue-100">
                        <div className="bg-blue-400 bg-opacity-20 p-1 rounded-full mr-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        Accédez à notre base de talents
                      </li>
                      <li className="flex items-center text-blue-100">
                        <div className="bg-blue-400 bg-opacity-20 p-1 rounded-full mr-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        Outils de recrutement avancés
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Form (Mobile: Bottom) */}
          <div className="w-full md:w-7/12 flex items-center justify-center p-6 order-2 md:order-none">
            <form onSubmit={handleSubmit} className="w-full max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 flex items-center">
                <Building2 className="mr-2" size={28} />
                Inscription Entreprise
              </h2>
              <p className="text-gray-600 mb-6 text-sm md:text-base">
                Créez votre compte entreprise pour commencer à recruter
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Company Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <Info className="mr-2" size={18} />
                    Informations de l'entreprise
                  </h3>
                </div>

                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Nom de l'entreprise *</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                      <Building2 size={16} />
                    </div>
                    <input
                      type="text"
                      name="companyName"
                      placeholder="Nom de votre entreprise"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-2 md:p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Secteur d'activité *</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                      <Briefcase size={16} />
                    </div>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-2 md:p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md bg-white"
                      required
                    >
                      <option value="">Sélectionnez un secteur</option>
                      {industries.map((industry, index) => (
                        <option key={index} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Site web</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                      <Globe size={16} />
                    </div>
                    <input
                      type="url"
                      name="website"
                      placeholder="https://www.votreentreprise.com"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-2 md:p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>

                <div className="relative md:col-span-2">
                  <label className="block text-gray-700 mb-2 text-sm">Adresse *</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      name="address"
                      placeholder="Adresse de l'entreprise"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-2 md:p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Code postal *</label>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Code postal"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Ville *</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Ville"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    required
                  />
                </div>

                {/* Contact Information */}
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <User className="mr-2" size={18} />
                    Informations du contact principal
                  </h3>
                </div>

                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Prénom *</label>
                  <input
                    type="text"
                    name="contactFirstName"
                    placeholder="Prénom"
                    value={formData.contactFirstName}
                    onChange={handleInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Nom *</label>
                  <input
                    type="text"
                    name="contactLastName"
                    placeholder="Nom"
                    value={formData.contactLastName}
                    onChange={handleInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Email professionnel *</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="email@entreprise.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-2 md:p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Téléphone *</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Numéro de téléphone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-2 md:p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Mot de passe *</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Créez un mot de passe"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-2 md:p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Confirmer le mot de passe *</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirmez votre mot de passe"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-2 md:p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                </div>

                {/* Terms and Registration Button */}
                <div className="md:col-span-2 mt-2">
                  <div className="flex items-start mb-4">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="mt-1 mr-2"
                      required
                    />
                    <label className="text-xs text-gray-600">
                      En créant un compte, j'accepte les <a href="#" className="text-blue-500 hover:underline">Conditions d'utilisation</a> et la <a href="#" className="text-blue-500 hover:underline">Politique de confidentialité</a>.
                    </label>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-lg flex items-center justify-center text-base"
                  >
                    Créer mon compte entreprise <ArrowRight className="ml-2" size={18} />
                  </button>
                </div>
              </div>
              
              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-gray-600 text-sm">
                  Vous avez déjà un compte?
                </p>
                <button 
                  type="button"
                  onClick={redirectToLogin}
                  className="mt-2 text-blue-500 hover:text-blue-700 font-medium"
                >
                  Se connecter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white text-gray-800 py-8 border-t border-gray-100 mt-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-4 mb-4">
            <a href="#" className="bg-gray-100 p-2 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-all duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
            </a>
            <a href="#" className="bg-gray-100 p-2 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-all duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
            </a>
            <a href="#" className="bg-gray-100 p-2 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-all duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path></svg>
            </a>
          </div>
          <p className="text-gray-500 text-sm">© 2025 Testing. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default CompanyRegistration;