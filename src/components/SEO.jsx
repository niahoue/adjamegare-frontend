import React from 'react'

const SEO = ({ 
  title, 
  description, 
  keywords = 'réservation bus, billets bus, voyage bus, transports, agence de voyage, côte d\'ivoire, adjamegare, abidjan, daloa, bouaké, korhogo, voyages internationaux, afrique ouest, transport routier', // Mots-clés par défaut plus riches
  image = 'https://adjamegare.com/assets/og-image.jpg', // Chemin complet recommandé pour l'image OG par défaut
  url = '', // Ne pas inclure le baseUrl ici, il est ajouté dynamiquement
  type = 'website', // Peut être "website", "article", "product", etc.
  breadcrumbs = [], // Pour le schéma BreadcrumbList: [{ name: "Accueil", item: "/" }]
  faqSchema = [], // Pour le schéma FAQPage: [{ question: "...", answer: "..." }]
  specificSchema = null, // Permet d'injecter un schéma JSON-LD personnalisé
}) => {
  const siteName = 'Adjamegare'; // Nom du site pour Open Graph
  const defaultTitle = 'Réservation de billets de bus en ligne en Côte d\'Ivoire et Afrique de l\'Ouest';
  const defaultDescription = 'Adjamegare : Votre plateforme de référence pour réserver vos billets de bus en ligne. Voyages sécurisés en Côte d\'Ivoire et vers les capitales d\'Afrique de l\'Ouest. Confort et flexibilité garantis.';
  const baseUrl = 'https://adjamegare.com'; // URL de base de votre site
  const twitterHandle = '@adjamegare_ci'; // Remplacez par le vrai compte Twitter de votre application

  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  // Assurez-vous que l'image est un chemin absolu pour Open Graph
  const fullImage = image.startsWith('http') || image.startsWith('//') ? image : `${baseUrl}${image}`;

  // Génération des schémas JSON-LD de base
  const generateBaseSchema = () => {
    const schemas = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": siteName,
        "url": baseUrl,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseUrl}/recherche?q={search_term_string}`, // Adaptez l'URL de recherche
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": siteName,
        "url": baseUrl,
        "logo": `${baseUrl}/logoAg.png`, // Chemin vers votre logo
        "sameAs": [
          "https://www.facebook.com/adjamegare", // Remplacez par vos vrais liens sociaux
          "https://twitter.com/adjamegare_ci",
          // "https://www.instagram.com/adjamegare_ci",
          // "https://www.linkedin.com/company/adjamegare"
        ]
      },
      // Exemple de LocalBusiness, à ajuster si vous avez des adresses physiques claires
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": siteName,
        "image": fullImage,
        "url": baseUrl,
        "telephone": "+22500000000", // Numéro de téléphone de support
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Rue de la Gare, Adjamé", // Exemple, ajustez
          "addressLocality": "Abidjan",
          "addressRegion": "Abidjan Autonomous District",
          "postalCode": "00000", // Si applicable
          "addressCountry": "CI"
        },
        "priceRange": "$$", // Indicateur de prix
        "openingHoursSpecification": [ // Exemple d'horaires d'ouverture
          { "@type": "OpeningHoursSpecification", "dayOfWeek": "https://schema.org/Monday", "opens": "07:00", "closes": "22:00" },
          { "@type": "OpeningHoursSpecification", "dayOfWeek": "https://schema.org/Tuesday", "opens": "07:00", "closes": "22:00" },
          { "@type": "OpeningHoursSpecification", "dayOfWeek": "https://schema.org/Wednesday", "opens": "07:00", "closes": "22:00" },
          { "@type": "OpeningHoursSpecification", "dayOfWeek": "https://schema.org/Thursday", "opens": "07:00", "closes": "22:00" },
          { "@type": "OpeningHoursSpecification", "dayOfWeek": "https://schema.org/Friday", "opens": "07:00", "closes": "22:00" },
          { "@type": "OpeningHoursSpecification", "dayOfWeek": "https://schema.org/Saturday", "opens": "08:00", "closes": "20:00" },
          { "@type": "OpeningHoursSpecification", "dayOfWeek": "https://schema.org/Sunday", "opens": "08:00", "closes": "18:00" }
        ],
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 5.336, // Latitude d'Abidjan (votre point central)
          "longitude": -4.026 // Longitude d'Abidjan
        }
      }
    ];

    // Ajouter BreadcrumbList si des breadcrumbs sont fournis
    if (breadcrumbs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": `${baseUrl}${crumb.item}`
        }))
      });
    }

    // Ajouter FAQPage si des FAQs sont fournis
    if (faqSchema.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqSchema.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      });
    }

    // Ajouter un schéma spécifique si fourni
    if (specificSchema) {
      schemas.push(specificSchema);
    }

    return schemas;
  };

  const jsonLdSchema = generateBaseSchema();

  return (
    <Helmet>
      {/* Balises de base */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullUrl} />
      <meta name="robots" content="index, follow" /> {/* Assure l'indexation */}

      {/* Open Graph Meta Tags (pour les réseaux sociaux comme Facebook, LinkedIn) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:image" content={fullImage} />
      {/* Spécifiez la taille de l'image si possible pour de meilleures performances */}
      <meta property="og:image:width" content="1200" /> {/* Largeur recommandée pour OG */}
      <meta property="og:image:height" content="630" /> {/* Hauteur recommandée pour OG */}
      <meta property="og:image:alt" content={`${title || siteName} - ${finalDescription.substring(0, 50)}...`} />

      {/* Twitter Card Meta Tags (pour Twitter) */}
      <meta name="twitter:card" content="summary_large_image" /> {/* Recommandé pour des images plus grandes */}
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} /> {/* Si c'est un compte d'auteur */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={`${title || siteName} - ${finalDescription.substring(0, 50)}...`} />

      {/* Robots spécifiques pour les crawlers */}
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />

      {/* Favicon (si vous les gérez globalement, sinon peut être inclus ici) */}
      <link rel="icon" href={`${baseUrl}/favicon.ico`} />
      <link rel="apple-touch-icon" href={`${baseUrl}/logo192.png`} /> {/* Exemple pour Apple Touch Icon */}

      {/* Multi-langue (si applicable, sinon ignorer) */}
      {/* <link rel="alternate" hrefLang="en-US" href={`${baseUrl}/en${url}`} /> */}
      {/* <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${url}`} /> */}

      {/* Schema.org JSON-LD */}
      {jsonLdSchema.map((schemaObj, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schemaObj)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
