import React, { useState, useEffect } from 'react';
import { Briefcase, ArrowRight, Users, CheckCircle, Book, Award, MapPin, FileText, Calendar } from 'lucide-react';


const Landing = () => {
  const [scrolled, setScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [stats, setStats] = useState({
    students: 0,
    companies: 0,
    jobs: 0,
    matches: 0
  });

  // Effet pour la barre de navigation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation des statistiques
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => ({
        students: Math.min(prevStats.students + 15, 5000),
        companies: Math.min(prevStats.companies + 3, 500),
        jobs: Math.min(prevStats.jobs + 5, 1200),
        matches: Math.min(prevStats.matches + 10, 3500)
      }));
    }, 50);

    // Arrêter l'animation après avoir atteint les valeurs maximales
    if (stats.students === 5000 && stats.companies === 500 && 
        stats.jobs === 1200 && stats.matches === 3500) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [stats]);

  // Rotation automatique des témoignages
  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(testimonialInterval);
  }, []);

  // Données des témoignages
  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Étudiante en informatique",
      company: "École Polytechnique",
      image: "/api/placeholder/100/100",
      text: "Grâce à JobConnect, j'ai trouvé mon stage de fin d'études en seulement 2 semaines ! L'interface est intuitive et les tests de compétences m'ont permis de me démarquer auprès des recruteurs."
    },
    {
      name: "Thomas Martin",
      role: "Directeur RH",
      company: "Tech Innovations",
      image: "/api/placeholder/100/100",
      text: "JobConnect a révolutionné notre processus de recrutement. Nous économisons un temps précieux grâce aux tests de compétences automatisés et nous trouvons des candidats parfaitement adaptés à nos besoins."
    },
    {
      name: "Sophie Leroux",
      role: "Étudiante en marketing",
      company: "HEC Paris",
      image: "/api/placeholder/100/100",
      text: "La plateforme est vraiment complète. J'ai pu mettre en valeur mes compétences et décrocher une alternance dans une entreprise qui correspond parfaitement à mes aspirations."
    }
  ];

  // Données des fonctionnalités
  const features = [
    {
      icon: <Users className="h-10 w-10 text-teal-500" />,
      title: "Profils spécialisés",
      description: "Créez un profil détaillé mettant en valeur vos compétences, expériences et aspirations."
    },
    {
      icon: <Briefcase className="h-10 w-10 text-teal-500" />,
      title: "Offres personnalisées",
      description: "Découvrez des offres d'emploi, de stage et d'alternance qui correspondent à votre profil."
    },
    {
      icon: <Book className="h-10 w-10 text-teal-500" />,
      title: "Tests de compétences",
      description: "Évaluez vos compétences grâce à des tests reconnus et valorisez-les auprès des recruteurs."
    },
    {
      icon: <Award className="h-10 w-10 text-teal-500" />,
      title: "Matching intelligent",
      description: "Notre algorithme met en relation les candidats et les offres selon les compétences et critères."
    },
    {
      icon: <FileText className="h-10 w-10 text-teal-500" />,
      title: "Suivi des candidatures",
      description: "Gérez et suivez toutes vos candidatures en un seul endroit avec des notifications en temps réel."
    },
    {
      icon: <Calendar className="h-10 w-10 text-teal-500" />,
      title: "Planification d'entretiens",
      description: "Organisez facilement vos entretiens avec un système de planification intégré."
    }
  ];

  // Données du comment ça marche
  const steps = [
    {
      number: "01",
      title: "Créez votre profil",
      for: "Étudiants",
      description: "Inscrivez-vous et complétez votre profil avec vos informations académiques, compétences et préférences."
    },
    {
      number: "02",
      title: "Passez des tests de compétences",
      for: "Étudiants",
      description: "Validez vos compétences grâce à nos tests spécialisés et augmentez votre visibilité auprès des recruteurs."
    },
    {
      number: "03",
      title: "Consultez les offres",
      for: "Étudiants",
      description: "Explorez les offres qui correspondent à votre profil et postulez en quelques clics."
    },
    {
      number: "04",
      title: "Publiez des offres",
      for: "Entreprises",
      description: "Créez des offres détaillées spécifiant les compétences et qualifications recherchées."
    },
    {
      number: "05",
      title: "Évaluez les candidats",
      for: "Entreprises",
      description: "Analysez les résultats des tests et identifiez les candidats qui correspondent le mieux à vos attentes."
    },
    {
      number: "06",
      title: "Organisez des entretiens",
      for: "Entreprises",
      description: "Planifiez des entretiens directement via la plateforme et gérez tout le processus de recrutement."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-teal-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">JobConnect</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-teal-600 transition-colors">Fonctionnalités</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-teal-600 transition-colors">Comment ça marche</a>
              <a href="#testimonials" className="text-gray-600 hover:text-teal-600 transition-colors">Témoignages</a>
              <a href="#faq" className="text-gray-600 hover:text-teal-600 transition-colors">FAQ</a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/login" className="text-teal-600 hover:text-teal-700 font-medium">Connexion</a>
              <a href="/registration" className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors">Inscription</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-6">
                Connectez <span className="text-teal-600">talents</span> et <span className="text-teal-600">opportunités</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                La plateforme qui révolutionne le recrutement en mettant l'accent sur les compétences et le matching intelligent.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <a href="/registration" className="bg-teal-600 text-white px-8 py-4 rounded-lg hover:bg-teal-700 transition-colors text-center flex items-center justify-center">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <a href="#features" className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-center">
                  Découvrir les fonctionnalités
                </a>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl transform translate-x-5 -translate-y-5 animate-float">
                <img src="/api/placeholder/600/400" alt="Dashboard JobConnect" className="w-full" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-teal-100 rounded-lg p-4 shadow-lg w-64">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-teal-600 mr-2" />
                  <span className="text-gray-800 font-medium">Match de compétences</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-teal-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stats.students.toLocaleString()}</div>
              <div className="text-teal-100">Étudiants</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stats.companies.toLocaleString()}</div>
              <div className="text-teal-100">Entreprises</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stats.jobs.toLocaleString()}</div>
              <div className="text-teal-100">Offres</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stats.matches.toLocaleString()}</div>
              <div className="text-teal-100">Matchs réussis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Fonctionnalités innovantes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              JobConnect offre des outils puissants pour simplifier le processus de recrutement et valoriser les compétences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-teal-50 p-3 rounded-lg inline-block mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comment ça marche</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un processus simple et efficace pour les étudiants et les entreprises.
            </p>
          </div>

          <div className="flex flex-wrap -mx-4">
            <div className="w-full md:w-1/2 px-4 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-md h-full">
                <h3 className="text-2xl font-bold text-teal-600 mb-6">Pour les étudiants</h3>
                <div className="space-y-8">
                  {steps.filter(step => step.for === "Étudiants").map((step, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 bg-teal-100 text-teal-600 font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">
                        {step.number}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h4>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 px-4 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-md h-full">
                <h3 className="text-2xl font-bold text-blue-600 mb-6">Pour les entreprises</h3>
                <div className="space-y-8">
                  {steps.filter(step => step.for === "Entreprises").map((step, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 bg-blue-100 text-blue-600 font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">
                        {step.number}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h4>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ce qu'ils en disent</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les témoignages de nos utilisateurs satisfaits.
            </p>
          </div>

          <div className="relative">
            <div className="max-w-3xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className={`transition-opacity duration-500 ${index === currentTestimonial ? 'opacity-100' : 'opacity-0 absolute top-0 left-0 right-0'}`}
                >
                  <div className="bg-gray-50 p-8 rounded-xl shadow-md">
                    <div className="flex items-center mb-6">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                        <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 italic">{testimonial.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full mx-1 focus:outline-none ${
                    index === currentTestimonial ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Témoignage ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-teal-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à transformer votre recherche de talents ou d'opportunités ?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-3xl mx-auto">
            Rejoignez JobConnect dès aujourd'hui et découvrez comment notre plateforme peut vous aider à atteindre vos objectifs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="/registration" className="bg-white text-teal-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-center">
              Créer un compte étudiant
            </a>
            <a href="/registration/company" className="bg-teal-500 text-white px-8 py-4 rounded-lg hover:bg-teal-400 transition-colors font-medium text-center">
              Inscription entreprise
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tout ce que vous devez savoir sur JobConnect.
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comment fonctionne le matching de compétences ?</h3>
              <p className="text-gray-600">Notre algorithme analyse les compétences requises pour une offre et les compare avec celles des candidats, en tenant compte des niveaux de maîtrise et des résultats aux tests de compétences.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">L'inscription est-elle gratuite ?</h3>
              <p className="text-gray-600">L'inscription est totalement gratuite pour les étudiants. Pour les entreprises, nous proposons plusieurs formules adaptées à leurs besoins.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Puis-je utiliser JobConnect pour trouver une alternance ?</h3>
              <p className="text-gray-600">Absolument ! JobConnect propose des offres de stage, d'alternance et d'emploi. Vous pouvez filtrer les résultats selon vos préférences.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comment sont vérifiées les entreprises ?</h3>
              <p className="text-gray-600">Chaque entreprise passe par un processus de vérification pour garantir l'authenticité des offres et la sécurité des candidats.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Briefcase className="h-8 w-8 text-teal-400" />
                <span className="ml-2 text-xl font-bold text-white">JobConnect</span>
              </div>
              <p className="text-gray-400 mb-4">La plateforme qui connecte talents et opportunités.</p>
            </div>
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-teal-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#how-it-works" className="hover:text-teal-400 transition-colors">Comment ça marche</a></li>
                <li><a href="#testimonials" className="hover:text-teal-400 transition-colors">Témoignages</a></li>
                <li><a href="#faq" className="hover:text-teal-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Légal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Mentions légales</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> Paris, France</li>
                <li><a href="mailto:contact@jobconnect.fr" className="hover:text-teal-400 transition-colors">contact@jobconnect.fr</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} JobConnect. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;