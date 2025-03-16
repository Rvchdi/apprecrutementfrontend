import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Briefcase, 
  MapPin, 
  Star, 
  CheckCircle, 
  Play,
  Layers,
  Zap,
  Smile
} from 'lucide-react';
import jobImage from '../assets/Job.png';

const Landing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    testimonials: false,
    cta: false
  });

  // Animation on scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible({
        hero: true, // Always visible
        features: scrollPosition > 300,
        testimonials: scrollPosition > 800,
        cta: scrollPosition > 1200
      });
    };

    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Briefcase className="text-teal-500" size={40} />,
      title: "Opportunités Ciblées",
      description: "Des offres de stage et d'emploi adaptées aux étudiants"
    },
    {
      icon: <Zap className="text-teal-500" size={40} />,
      title: "Processus Rapide",
      description: "Candidatez en quelques clics avec notre plateforme simplifiée"
    },
    {
      icon: <Smile className="text-teal-500" size={40} />,
      title: "Accompagnement",
      description: "Un support dédié pour booster votre recherche professionnelle"
    }
  ];

  const testimonials = [
    {
      name: "Marie D.",
      role: "Étudiante en Marketing",
      quote: "J'ai trouvé mon stage de rêve en moins d'un mois !",
      rating: 5
    },
    {
      name: "Lucas M.",
      role: "Étudiant en Informatique",
      quote: "Une plateforme intuitive qui change vraiment la donne.",
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 text-gray-800 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold flex items-center text-teal-600 transition-transform hover:scale-105 duration-300">
            <Briefcase className="mr-2" size={32} />
            Testing
          </div>
          <nav className="space-x-6">
            <a href="#" className="hover:text-teal-500 transition-colors duration-300">Accueil</a>
            <a href="#" className="hover:text-teal-500 transition-colors duration-300">Offres</a>
            <a href="#" className="hover:text-teal-500 transition-colors duration-300">À propos</a>
            <a href="#" className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-all duration-300 hover:shadow-lg">Connexion</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-sky-50 text-gray-800 py-20">
        <div className={`container mx-auto px-4 flex flex-col md:flex-row items-center transition-all duration-1000 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-800">
              Trouvez Votre <span className="text-teal-500">Opportunité</span> Professionnelle
            </h1>
            <p className="text-xl text-gray-600">
              La plateforme qui connecte les étudiants talentueux avec les meilleures entreprises
            </p>
            
            <div className="relative flex items-center group">
              <div className="absolute left-4 text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                <Search size={20} />
              </div>
              <input 
                type="text"
                placeholder="Recherchez un stage, un emploi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
              />
              <button className="absolute right-2 bg-teal-500 text-white px-4 py-2 rounded-full hover:bg-teal-600 transition-all duration-300 hover:shadow-md">
                Rechercher
              </button>
            </div>

            <div className="flex space-x-4 items-center">
              <div className="flex -space-x-2">
                <img 
                  src="/api/placeholder/40/40" 
                  alt="User" 
                  className="rounded-full border-2 border-white hover:scale-110 transition-transform duration-300" 
                />
                <img 
                  src="/api/placeholder/40/40" 
                  alt="User" 
                  className="rounded-full border-2 border-white hover:scale-110 transition-transform duration-300" 
                />
                <img 
                  src="/api/placeholder/40/40" 
                  alt="User" 
                  className="rounded-full border-2 border-white hover:scale-110 transition-transform duration-300" 
                />
              </div>
              <span className="text-gray-500">ISMAGI based platform</span>
            </div>
          </div>

          <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center animate-float">
            <div className="w-full max-w-[500px] transform hover:scale-105 transition-transform duration-500 hover:rotate-1">
               <img src={jobImage} alt="Register Illustration" className="w-full drop-shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-12 transition-all duration-1000 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Pourquoi Choisir <span className="text-teal-500">JobConnect</span> ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une plateforme conçue spécifiquement pour les étudiants, offrant des opportunités uniques et un accompagnement personnalisé.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`bg-white p-6 rounded-xl border border-gray-100 text-center transition-all duration-500 hover:shadow-xl hover:-translate-y-2 ${isVisible.features ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="flex justify-center mb-4 bg-teal-50 p-4 rounded-full w-20 h-20 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-12 transition-all duration-1000 ${isVisible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Ce Que Disent <span className="text-teal-500">Nos Utilisateurs</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className={`bg-white p-6 rounded-xl shadow-sm max-w-md transition-all duration-500 hover:shadow-xl ${isVisible.testimonials ? 'opacity-100 translate-x-0' : index % 2 === 0 ? 'opacity-0 -translate-x-10' : 'opacity-0 translate-x-10'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <img 
                      src="/api/placeholder/50/50" 
                      alt={testimonial.name} 
                      className="rounded-full mr-4 border-2 border-teal-100" 
                    />
                    <div className="absolute -bottom-1 -right-1 bg-teal-500 text-white rounded-full p-1">
                      <CheckCircle size={16} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex text-yellow-400">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} fill="currentColor" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-br from-teal-500 to-sky-400 text-white py-20">
        <div className={`container mx-auto px-4 text-center transition-all duration-1000 ${isVisible.cta ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h2 className="text-4xl font-bold mb-6">
            Prêt à Décoller Votre Carrière ?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Rejoignez testing et transformez vos ambitions professionnelles en réalité
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-teal-600 px-6 py-3 rounded-full hover:bg-gray-100 font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105">
              Créer un Compte
            </button>
            <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full hover:bg-white hover:text-teal-600 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105">
              <Play size={20} className="mr-2" /> Voir Comment Ça Marche
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-800 py-12 border-t border-gray-100">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center text-teal-600">
              <Briefcase className="mr-2" size={24} /> testing
            </h3>
            <p className="text-gray-500">
              Connecter les talents étudiants avec les opportunités professionnelles
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-800">Liens Rapides</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-teal-500 transition-colors duration-300">Offres</a></li>
              <li><a href="#" className="text-gray-500 hover:text-teal-500 transition-colors duration-300">Entreprises</a></li>
              <li><a href="#" className="text-gray-500 hover:text-teal-500 transition-colors duration-300">Ressources</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-800">Légal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-teal-500 transition-colors duration-300">Mentions Légales</a></li>
              <li><a href="#" className="text-gray-500 hover:text-teal-500 transition-colors duration-300">CGU</a></li>
              <li><a href="#" className="text-gray-500 hover:text-teal-500 transition-colors duration-300">Confidentialité</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-800">Contact</h4>
            <p className="text-gray-500">contact@jobconnect.fr</p>
            <p className="text-gray-500">+33 1 23 45 67 89</p>
            <div className="flex space-x-3 mt-4">
              <a href="#" className="bg-gray-100 p-2 rounded-full hover:bg-teal-50 hover:text-teal-500 transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
              </a>
              <a href="#" className="bg-gray-100 p-2 rounded-full hover:bg-teal-50 hover:text-teal-500 transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
              </a>
              <a href="#" className="bg-gray-100 p-2 rounded-full hover:bg-teal-50 hover:text-teal-500 transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm">
          <p>© 2025 JobConnect. Tous droits réservés.</p>
        </div>
      </footer>

      {/* Add keyframes for the floating animation */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;