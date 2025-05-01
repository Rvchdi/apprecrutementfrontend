import React, { useState, useEffect } from 'react';
import { Briefcase, ArrowRight, Users, CheckCircle, Book, Award, MapPin, FileText, Calendar, Star, MessageSquare, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// --- Mock Data (Keep or replace with actual data fetching) ---

const testimonialsData = [
  {
    name: "Marie Dubois",
    role: "Étudiante en Informatique",
    company: "Polytechnique",
    // Replace with actual image path or URL
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8&auto=format&fit=crop&w=100&q=60",
    text: "Incroyable ! J'ai trouvé mon stage de fin d'études en 2 semaines sur JobConnect. Les tests de compétences m'ont vraiment aidée à me démarquer.",
    rating: 5
  },
  {
    name: "Thomas Martin",
    role: "Directeur RH",
    company: "Tech Innovations",
    // Replace with actual image path or URL
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8&auto=format&fit=crop&w=100&q=60",
    text: "JobConnect a transformé notre recrutement. Les tests de compétences automatisés nous font gagner un temps fou et garantissent des candidats qualifiés.",
    rating: 5
  },
  {
    name: "Sophie Leroux",
    role: "Alternante Marketing",
    company: "HEC Paris Alum",
    // Replace with actual image path or URL
    image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8&auto=format&fit=crop&w=100&q=60",
    text: "La plateforme est super intuitive. J'ai pu valoriser mes compétences et décrocher une alternance dans une entreprise qui me correspond parfaitement.",
    rating: 4
  }
];

const featuresData = [
  { icon: Users, title: "Profils Enrichis", description: "Mettez en valeur compétences, expériences et portfolio." },
  { icon: Briefcase, title: "Offres Ciblées", description: "Stages, alternances, emplois correspondant à votre profil." },
  { icon: CheckCircle, title: "Compétences Validées", description: "Tests reconnus pour attester de votre savoir-faire." },
  { icon: TrendingUp, title: "Matching Intelligent", description: "Algorithme liant talents et besoins précis des entreprises." },
  { icon: FileText, title: "Suivi Simplifié", description: "Gérez vos candidatures et recevez des notifications." },
  { icon: Calendar, title: "Entretiens Facilités", description: "Planifiez vos rendez-vous directement sur la plateforme." }
];

const howItWorksSteps = [
    { number: "01", title: "Créez Votre Profil", description: "Étudiant ou entreprise, inscrivez-vous et détaillez vos informations clés.", icon: Users },
    { number: "02", title: "Validez & Publiez", description: "Étudiants : passez des tests. Entreprises : publiez vos offres.", icon: CheckCircle },
    { number: "03", title: "Explorez & Connectez", description: "Trouvez les offres ou candidats idéaux grâce au matching.", icon: TrendingUp },
    { number: "04", title: "Postulez & Évaluez", description: "Processus de candidature et d'évaluation simplifié.", icon: FileText },
    { number: "05", title: "Planifiez & Recrutez", description: "Organisez les entretiens et finalisez le recrutement.", icon: Calendar }
];

// --- Landing Component ---

const Landing = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [scrolled, setScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [stats, setStats] = useState({ students: 0, companies: 0, jobs: 0, matches: 0 });

  // Target stats
  const targetStats = { students: 5000, companies: 500, jobs: 1200, matches: 3500 };

  // Scroll effect for Navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Stats animation effect
  useEffect(() => {
    const interval = setInterval(() => {
        setStats(prev => ({
            students: Math.min(prev.students + Math.ceil((targetStats.students - prev.students) / 10), targetStats.students),
            companies: Math.min(prev.companies + Math.ceil((targetStats.companies - prev.companies) / 10), targetStats.companies),
            jobs: Math.min(prev.jobs + Math.ceil((targetStats.jobs - prev.jobs) / 10), targetStats.jobs),
            matches: Math.min(prev.matches + Math.ceil((targetStats.matches - prev.matches) / 10), targetStats.matches)
        }));
    }, 60); // Adjust speed/smoothness

    // Check if all stats reached target
    if (Object.keys(stats).every(key => stats[key] === targetStats[key])) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [stats, targetStats]); // Rerun if targets change (though they don't here)

  // Testimonial rotation effect
  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonialsData.length);
    }, 6000); // Increased interval
    return () => clearInterval(testimonialInterval);
  }, []);

  // --- Render Function ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-teal-50 to-white font-sans antialiased text-gray-800">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ease-in-out ${scrolled ? 'bg-white/90 backdrop-blur-lg shadow-lg py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div
                onClick={() => navigate('/')} // Navigate home on click
                className="flex items-center cursor-pointer group"
            >
              <Briefcase className={`h-7 w-7 transition-colors ${scrolled ? 'text-teal-600' : 'text-teal-600'}`} />
              <span className={`ml-2 text-2xl font-bold transition-colors ${scrolled ? 'text-gray-900' : 'text-gray-900'} group-hover:text-teal-600`}>JobConnect</span>
            </div>
            <div className="hidden md:flex items-center space-x-8 font-medium">
              <a href="#features" className="text-gray-600 hover:text-teal-600 transition-colors">Fonctionnalités</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-teal-600 transition-colors">Comment ça marche</a>
              <a href="#testimonials" className="text-gray-600 hover:text-teal-600 transition-colors">Témoignages</a>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate('/login')} className="px-5 py-2 rounded-lg text-sm font-medium text-teal-600 hover:bg-teal-50 transition-colors">
                Connexion
              </button>
              <button onClick={() => navigate('/registration')} className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                Inscription Gratuite
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[85vh] flex items-center">
        {/* Decorative Blobs (Optional) */}
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-teal-100 rounded-full opacity-30 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-sky-100 rounded-full opacity-30 blur-3xl animate-pulse-slow animation-delay-2000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 mb-6 tracking-tight">
                Révélez votre <span className="text-teal-600">potentiel</span>. Trouvez votre <span className="text-sky-600">voie</span>.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0">
                JobConnect est la plateforme nouvelle génération qui connecte les talents étudiants aux meilleures opportunités professionnelles grâce à une approche basée sur les compétences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/registration')}
                  className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center text-lg"
                >
                  Commencer Maintenant <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-gray-700 px-8 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors duration-300 shadow-sm hover:shadow-md flex items-center justify-center text-lg"
                >
                  Découvrir Plus
                </button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              {/* Replace with a relevant, high-quality image or illustration */}
              <img
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                alt="Étudiants collaborant"
                className="rounded-3xl shadow-2xl transform transition duration-500 hover:scale-105"
              />
               {/* Example floating card */}
               <div className="absolute -bottom-8 -left-10 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center space-x-3 animate-pulse-slow animation-delay-1000">
                   <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                   <div>
                       <p className="text-sm font-semibold text-gray-800">Matching Réussi</p>
                       <p className="text-xs text-gray-500">Profil compatible à 92%</p>
                   </div>
               </div>
            </div>
          </div>
        </div>
      </section>

       {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-teal-600 to-sky-600">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {Object.entries(stats).map(([key, value]) => (
                        <div key={key} className="p-4">
                            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-1 tracking-tight">
                                {value.toLocaleString()}+
                            </div>
                            <div className="text-sm sm:text-base text-teal-100 capitalize">
                                {key === 'students' ? 'Étudiants Inscrits' :
                                 key === 'companies' ? 'Entreprises Partenaires' :
                                 key === 'jobs' ? 'Offres Actives' :
                                 'Matchs Réussis'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>


      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Au cœur de JobConnect</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Des outils conçus pour valoriser vos compétences et simplifier votre recherche.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {featuresData.map((feature, index) => (
              <div key={index} className="group bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-transparent hover:border-teal-100">
                 <div className="relative inline-block mb-5">
                     <div className="absolute -inset-2 bg-teal-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                     <div className="relative bg-teal-100 p-4 rounded-lg inline-block">
                         <feature.icon className="h-8 w-8 text-teal-600 transition-transform duration-300 group-hover:scale-110" />
                     </div>
                 </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* How it Works Section - Simplified */}
        <section id="how-it-works" className="py-20 lg:py-28 bg-gradient-to-b from-white via-sky-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 lg:mb-20">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Le chemin vers l'opportunité</h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                        Un processus simple et transparent pour étudiants et entreprises.
                    </p>
                </div>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                   {howItWorksSteps.map((step, index) => (
                       <div key={index} className="flex flex-col items-center text-center p-4 group">
                           <div className={`relative mb-4 flex items-center justify-center h-16 w-16 rounded-full transition-all duration-300 ${index % 2 === 0 ? 'bg-teal-100 group-hover:bg-teal-200' : 'bg-sky-100 group-hover:bg-sky-200'}`}>
                               <step.icon className={`h-8 w-8 transition-colors duration-300 ${index % 2 === 0 ? 'text-teal-600' : 'text-sky-600'}`} />
                               <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-white">
                                   {step.number}
                               </span>
                           </div>
                           <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                           <p className="text-sm text-gray-600">{step.description}</p>
                       </div>
                   ))}
                </div>
            </div>
        </section>


      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Ils nous font confiance</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez l'impact de JobConnect à travers leurs expériences.
            </p>
          </div>
          <div className="relative max-w-3xl mx-auto h-80"> {/* Fixed height container */}
            {testimonialsData.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentTestimonial ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <div className="bg-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col justify-center">
                   <div className="flex items-center mb-5">
                     <img
                       src={testimonial.image}
                       alt={testimonial.name}
                       className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-teal-200"
                     />
                     <div>
                       <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                       <p className="text-sm text-gray-600">{testimonial.role} @ {testimonial.company}</p>
                       <div className="flex items-center mt-1">
                           {[...Array(5)].map((_, i) => (
                               <Star key={i} size={14} className={i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                           ))}
                       </div>
                     </div>
                   </div>
                   <blockquote className="text-gray-700 italic text-lg leading-relaxed relative pl-6">
                      <span className="absolute left-0 top-0 text-4xl text-teal-300 font-bold">&ldquo;</span>
                      {testimonial.text}
                   </blockquote>
                </div>
              </div>
            ))}
          </div>
          {/* Carousel Controls */}
          <div className="flex justify-center mt-10">
            {testimonialsData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2.5 h-2.5 rounded-full mx-1.5 focus:outline-none transition-colors duration-300 ${
                  index === currentTestimonial ? 'bg-teal-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Voir témoignage ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-teal-600 to-sky-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Prêt à lancer votre carrière ou trouver le talent idéal ?
          </h2>
          <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers d'étudiants et d'entreprises qui façonnent l'avenir professionnel sur JobConnect.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
               onClick={() => navigate('/registration')}
              className="bg-white text-teal-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              Je suis Étudiant
            </button>
            <button
               onClick={() => navigate('/registration/company')}
              className="bg-sky-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-sky-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              Je suis Entreprise
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Brand */}
            <div>
              <div className="flex items-center mb-4">
                <Briefcase className="h-7 w-7 text-teal-400" />
                <span className="ml-2 text-xl font-bold text-white">JobConnect</span>
              </div>
              <p className="text-sm mb-4">Connecter les talents aux opportunités de demain.</p>
               {/* Optional: Social Links */}
               {/* <div className="flex space-x-4">
                 <a href="#" className="hover:text-teal-400"><MessageSquare size={18} /></a>
                 <a href="#" className="hover:text-teal-400"><Users size={18} /></a>
               </div> */}
            </div>
            {/* Column 2: Navigation */}
            <div>
              <h3 className="text-white text-base font-semibold mb-4 tracking-wide">Navigation</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-teal-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#how-it-works" className="hover:text-teal-400 transition-colors">Comment ça marche</a></li>
                <li><a href="#testimonials" className="hover:text-teal-400 transition-colors">Témoignages</a></li>
                <li><a href="/login" className="hover:text-teal-400 transition-colors">Connexion</a></li>
              </ul>
            </div>
            {/* Column 3: Legal */}
            <div>
              <h3 className="text-white text-base font-semibold mb-4 tracking-wide">Légal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy-policy" className="hover:text-teal-400 transition-colors">Politique de confidentialité</a></li>
                <li><a href="/terms-of-service" className="hover:text-teal-400 transition-colors">Conditions d'utilisation</a></li>
                 {/* Add Mentions Légales if applicable */}
                 {/* <li><a href="/legal-notice" className="hover:text-teal-400 transition-colors">Mentions Légales</a></li> */}
              </ul>
            </div>
            {/* Column 4: Contact */}
            <div>
               <h3 className="text-white text-base font-semibold mb-4 tracking-wide">Contact</h3>
               <ul className="space-y-2 text-sm">
                 <li className="flex items-center"><MapPin className="h-4 w-4 mr-2 flex-shrink-0" /> Rabat, Maroc</li>
                 <li><a href="mailto:contact@jobconnect.ma" className="hover:text-teal-400 transition-colors break-all">contact@jobconnect.ma</a></li>
                 {/* Add phone if available */}
                 {/* <li><a href="tel:+212xxxxxxxxx" className="hover:text-teal-400 transition-colors">+212 X XX XX XX XX</a></li> */}
               </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} JobConnect. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;