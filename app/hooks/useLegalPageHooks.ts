import { useState } from "react";

// Define types for the legal page sections
export type LegalSection = {
  title: string;
  content: string[];
};

// Hook to manage the legal page states
export const useLegalPageStates = (languageCode: string) => {
  // Define the legal content based on the language
  const [legalContent] = useState<{
    termsOfUse: LegalSection;
    legalNotice: LegalSection;
    dataProtection: LegalSection;
    cookies: LegalSection;
    payments: LegalSection;
  }>(() => {
    if (languageCode === "en") {
      return {
        termsOfUse: {
          title: "Terms of Use",
          content: [
            "Welcome to Tour To Valencia. By accessing and using our website and services, you agree to comply with and be bound by the following terms and conditions.",
            "The content of this website is for general information and use only. It is subject to change without notice.",
            "Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable.",
            "This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance, and graphics. Reproduction is prohibited other than in accordance with the copyright notice.",
            "Unauthorized use of this website may give rise to a claim for damages and/or be a criminal offense.",
            "This website may include links to other websites. These links are provided for your convenience to provide further information. They do not signify that we endorse the website(s). We have no responsibility for the content of the linked website(s).",
            "Your use of this website and any dispute arising out of such use of the website is subject to the laws of Spain."
          ]
        },
        legalNotice: {
          title: "Legal Notice",
          content: [
            "Tour To Valencia is a registered company in Spain, dedicated to providing guided tours and travel experiences in Valencia and surrounding areas.",
            "VAT Number: [VAT Number]",
            "Business Registration Number: [Registration Number]",
            "Registered Address: [Company Address], Valencia, Spain",
            "Contact Email: tourtovalencia@gmail.com",
            "Contact Phone: +34 625 291 391",
            "All services provided by Tour To Valencia are subject to Spanish law and regulations, particularly those related to tourism and consumer protection.",
            "Tour To Valencia holds all necessary licenses and insurance required by Spanish law to operate as a tour provider."
          ]
        },
        dataProtection: {
          title: "Data Protection Policy",
          content: [
            "At Tour To Valencia, we are committed to protecting and respecting your privacy. This policy explains how we collect, use, and protect your personal information.",
            "Information We Collect: When you book a tour or contact us, we collect personal information such as your name, email address, phone number, and nationality. For bookings, we may also collect payment information.",
            "How We Use Your Information: We use your information to provide our services, process payments, send booking confirmations, and communicate important information about your tour. We may also use your information to improve our services and send you promotional materials if you have consented.",
            "Data Storage and Security: Your personal data is stored securely on our servers and is protected by appropriate technical and organizational measures. We retain your data only for as long as necessary to fulfill the purposes for which it was collected.",
            "Your Rights: Under the General Data Protection Regulation (GDPR), you have the right to access, rectify, erase, restrict processing, object to processing, and data portability of your personal information. You also have the right to withdraw consent at any time.",
            "Third-Party Sharing: We may share your information with third-party service providers who help us deliver our services, such as payment processors and email service providers. We ensure these providers maintain appropriate security measures.",
            "International Transfers: Your data may be transferred to and processed in countries outside the European Economic Area (EEA). We ensure appropriate safeguards are in place to protect your information.",
            "Changes to This Policy: We may update this policy from time to time. Any changes will be posted on this page.",
            "Contact Us: If you have any questions about this policy or how we handle your personal information, please contact us at tourtovalencia@gmail.com."
          ]
        },
        cookies: {
          title: "Cookie Policy",
          content: [
            "Our website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content.",
            "What Are Cookies: Cookies are small text files that are stored on your device when you visit a website. They help the website remember your preferences and actions.",
            "Types of Cookies We Use:",
            "Essential Cookies: These are necessary for the website to function properly and cannot be turned off.",
            "Performance Cookies: These help us understand how visitors interact with our website by collecting and reporting information anonymously.",
            "Functionality Cookies: These allow the website to provide enhanced functionality and personalization.",
            "Targeting Cookies: These are used to deliver advertisements more relevant to you and your interests.",
            "Managing Cookies: Most web browsers allow you to control cookies through their settings. You can usually find these settings in the 'options' or 'preferences' menu of your browser.",
            "By continuing to use our website, you consent to our use of cookies in accordance with this policy. If you do not wish to accept cookies, you can adjust your browser settings or stop using our website."
          ]
        },
        payments: {
          title: "Payment Information",
          content: [
            "Tour To Valencia offers secure payment options for booking our tours and services.",
            "Payment Methods: We accept payments via credit/debit cards (Visa, MasterCard, American Express) and PayPal. All transactions are processed securely.",
            "Payment Security: All payment information is encrypted using SSL technology. We do not store your full credit card details on our servers.",
            "Pricing and Currency: All prices are listed in Euros (€). For payments made in other currencies, conversion rates are determined by your payment provider.",
            "Booking Confirmation: Upon successful payment, you will receive a booking confirmation via email with all the details of your tour.",
            "Cancellation and Refunds: For cancellations made at least 24 hours before the scheduled tour, a full refund will be issued. No refunds are available for cancellations made less than 24 hours before the scheduled tour or for no-shows.",
            "Weather Conditions: In case of extreme weather conditions that make it unsafe to conduct the tour, we will offer you the option to reschedule or receive a full refund.",
            "Minimum Participants: Some tours require a minimum number of participants. If this minimum is not reached, we reserve the right to cancel the tour and offer you a full refund or the option to reschedule.",
            "For any questions regarding payments, please contact us at tourtovalencia@gmail.com."
          ]
        }
      };
    } else {
      // Spanish content
      return {
        termsOfUse: {
          title: "Condiciones de Uso",
          content: [
            "Bienvenido a Tour To Valencia. Al acceder y utilizar nuestro sitio web y servicios, acepta cumplir y estar sujeto a los siguientes términos y condiciones.",
            "El contenido de este sitio web es solo para información y uso general. Está sujeto a cambios sin previo aviso.",
            "El uso de cualquier información o material en este sitio web es completamente bajo su propio riesgo, por el cual no seremos responsables.",
            "Este sitio web contiene material que es propiedad o está licenciado a nosotros. Este material incluye, pero no se limita a, el diseño, la disposición, la apariencia y los gráficos. La reproducción está prohibida excepto de acuerdo con el aviso de derechos de autor.",
            "El uso no autorizado de este sitio web puede dar lugar a una reclamación por daños y/o ser un delito penal.",
            "Este sitio web puede incluir enlaces a otros sitios web. Estos enlaces se proporcionan para su conveniencia para proporcionar más información. No significan que respaldamos el sitio web. No tenemos responsabilidad por el contenido de los sitios web enlazados.",
            "Su uso de este sitio web y cualquier disputa que surja de dicho uso del sitio web está sujeto a las leyes de España."
          ]
        },
        legalNotice: {
          title: "Aviso Legal",
          content: [
            "Tour To Valencia es una empresa registrada en España, dedicada a proporcionar tours guiados y experiencias de viaje en Valencia y sus alrededores.",
            "Número de IVA: [Número de IVA]",
            "Número de Registro Mercantil: [Número de Registro]",
            "Dirección Registrada: [Dirección de la Empresa], Valencia, España",
            "Email de Contacto: tourtovalencia@gmail.com",
            "Teléfono de Contacto: +34 625 291 391",
            "Todos los servicios proporcionados por Tour To Valencia están sujetos a la ley y regulaciones españolas, particularmente aquellas relacionadas con el turismo y la protección del consumidor.",
            "Tour To Valencia posee todas las licencias y seguros necesarios requeridos por la ley española para operar como proveedor de tours."
          ]
        },
        dataProtection: {
          title: "Política de Protección de Datos",
          content: [
            "En Tour To Valencia, estamos comprometidos con la protección y el respeto de su privacidad. Esta política explica cómo recopilamos, utilizamos y protegemos su información personal.",
            "Información que Recopilamos: Cuando reserva un tour o nos contacta, recopilamos información personal como su nombre, dirección de correo electrónico, número de teléfono y nacionalidad. Para las reservas, también podemos recopilar información de pago.",
            "Cómo Utilizamos su Información: Utilizamos su información para proporcionar nuestros servicios, procesar pagos, enviar confirmaciones de reserva y comunicar información importante sobre su tour. También podemos utilizar su información para mejorar nuestros servicios y enviarle materiales promocionales si ha dado su consentimiento.",
            "Almacenamiento y Seguridad de Datos: Sus datos personales se almacenan de forma segura en nuestros servidores y están protegidos por medidas técnicas y organizativas apropiadas. Conservamos sus datos solo durante el tiempo necesario para cumplir los fines para los que fueron recopilados.",
            "Sus Derechos: Bajo el Reglamento General de Protección de Datos (RGPD), tiene derecho a acceder, rectificar, borrar, restringir el procesamiento, objetar el procesamiento y la portabilidad de sus datos personales. También tiene derecho a retirar su consentimiento en cualquier momento.",
            "Compartir con Terceros: Podemos compartir su información con proveedores de servicios externos que nos ayudan a prestar nuestros servicios, como procesadores de pagos y proveedores de servicios de correo electrónico. Nos aseguramos de que estos proveedores mantengan medidas de seguridad apropiadas.",
            "Transferencias Internacionales: Sus datos pueden ser transferidos y procesados en países fuera del Espacio Económico Europeo (EEE). Nos aseguramos de que se implementen las salvaguardias apropiadas para proteger su información.",
            "Cambios en esta Política: Podemos actualizar esta política de vez en cuando. Cualquier cambio se publicará en esta página.",
            "Contáctenos: Si tiene alguna pregunta sobre esta política o sobre cómo manejamos su información personal, por favor contáctenos en tourtovalencia@gmail.com."
          ]
        },
        cookies: {
          title: "Política de Cookies",
          content: [
            "Nuestro sitio web utiliza cookies para mejorar su experiencia de navegación, analizar el tráfico del sitio y personalizar el contenido.",
            "¿Qué Son las Cookies?: Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Ayudan al sitio web a recordar sus preferencias y acciones.",
            "Tipos de Cookies que Utilizamos:",
            "Cookies Esenciales: Son necesarias para que el sitio web funcione correctamente y no se pueden desactivar.",
            "Cookies de Rendimiento: Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web recopilando y reportando información de forma anónima.",
            "Cookies de Funcionalidad: Permiten al sitio web proporcionar una funcionalidad y personalización mejoradas.",
            "Cookies de Orientación: Se utilizan para entregar anuncios más relevantes para usted y sus intereses.",
            "Gestión de Cookies: La mayoría de los navegadores web le permiten controlar las cookies a través de su configuración. Normalmente puede encontrar esta configuración en el menú 'opciones' o 'preferencias' de su navegador.",
            "Al continuar utilizando nuestro sitio web, usted consiente nuestro uso de cookies de acuerdo con esta política. Si no desea aceptar cookies, puede ajustar la configuración de su navegador o dejar de usar nuestro sitio web."
          ]
        },
        payments: {
          title: "Información de Pagos",
          content: [
            "Tour To Valencia ofrece opciones de pago seguras para reservar nuestros tours y servicios.",
            "Métodos de Pago: Aceptamos pagos mediante tarjetas de crédito/débito (Visa, MasterCard, American Express) y PayPal. Todas las transacciones se procesan de forma segura.",
            "Seguridad de Pago: Toda la información de pago está encriptada utilizando tecnología SSL. No almacenamos los detalles completos de su tarjeta de crédito en nuestros servidores.",
            "Precios y Moneda: Todos los precios están listados en Euros (€). Para pagos realizados en otras monedas, las tasas de conversión son determinadas por su proveedor de pagos.",
            "Confirmación de Reserva: Tras el pago exitoso, recibirá una confirmación de reserva por correo electrónico con todos los detalles de su tour.",
            "Cancelaciones y Reembolsos: Para cancelaciones realizadas al menos 24 horas antes del tour programado, se emitirá un reembolso completo. No hay reembolsos disponibles para cancelaciones realizadas menos de 24 horas antes del tour programado o para no presentaciones.",
            "Condiciones Meteorológicas: En caso de condiciones meteorológicas extremas que hagan inseguro realizar el tour, le ofreceremos la opción de reprogramar o recibir un reembolso completo.",
            "Participantes Mínimos: Algunos tours requieren un número mínimo de participantes. Si no se alcanza este mínimo, nos reservamos el derecho de cancelar el tour y ofrecerle un reembolso completo o la opción de reprogramar.",
            "Para cualquier pregunta relacionada con los pagos, por favor contáctenos en tourtovalencia@gmail.com."
          ]
        }
      };
    }
  });

  return {
    legalContent,
  };
}; 