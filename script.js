/**
 * Robô LED Partner - Bio Links Client Script
 * Handles: Web Share API, QR Code Modal, vCard Download, Toast Notifications, Link Analytics Hooks
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Toast Notification Helper
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  let toastTimeout = null;

  function showToast(message) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;
    
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // 3. Web Share API & Copy Link
  const btnShare = document.getElementById('btnShare');
  const currentUrl = window.location.href.includes('http') 
    ? window.location.href 
    : 'https://roboledpartner.com.br/links';

  if (btnShare) {
    btnShare.addEventListener('click', async () => {
      const shareData = {
        title: 'Robô LED Partner | Links Oficiais',
        text: '🤖 O Robô LED que transforma sua festa em espetáculo! Faça sua cotação online:',
        url: currentUrl
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          if (err.name !== 'AbortError') {
            copyToClipboard(currentUrl);
          }
        }
      } else {
        copyToClipboard(currentUrl);
      }
    });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Link copiado para a área de transferência! 🚀');
      }).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  }

  function fallbackCopyText(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      showToast('Link copiado para a área de transferência! 🚀');
    } catch (e) {
      showToast('Não foi possível copiar o link.');
    }
    document.body.removeChild(input);
  }

  // 4. QR Code Modal
  const btnOpenQr = document.getElementById('btnOpenQr');
  const btnCloseQr = document.getElementById('btnCloseQr');
  const qrModal = document.getElementById('qrModal');
  const qrImage = document.getElementById('qrImage');
  const btnCopyPageLink = document.getElementById('btnCopyPageLink');

  if (btnOpenQr && qrModal) {
    btnOpenQr.addEventListener('click', () => {
      // Generate QR Code URL using QR Server API
      const qrTarget = encodeURIComponent(currentUrl);
      if (qrImage) {
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${qrTarget}&color=120a28&bgcolor=ffffff`;
      }
      qrModal.classList.add('active');
      qrModal.setAttribute('aria-hidden', 'false');
    });
  }

  if (btnCloseQr && qrModal) {
    btnCloseQr.addEventListener('click', () => {
      closeQrModal();
    });
  }

  if (qrModal) {
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) {
        closeQrModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && qrModal && qrModal.classList.contains('active')) {
      closeQrModal();
    }
  });

  function closeQrModal() {
    if (qrModal) {
      qrModal.classList.remove('active');
      qrModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (btnCopyPageLink) {
    btnCopyPageLink.addEventListener('click', () => {
      copyToClipboard(currentUrl);
    });
  }

  // 5. Save Contact (.vcf vCard Download)
  const btnSaveContact = document.getElementById('btnSaveContact');
  if (btnSaveContact) {
    btnSaveContact.addEventListener('click', () => {
      const vcardContent = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:Robô LED Partner',
        'ORG:Robô LED Partner',
        'TITLE:Show de Robô LED para Eventos',
        'TEL;TYPE=CELL,VOICE:+5511919973647',
        'EMAIL;TYPE=PREF,INTERNET:roboledpartner@gmail.com',
        'URL;TYPE=WORK:https://roboledpartner.com.br/',
        'URL;TYPE=Cotação:https://cotacao.roboledpartner.com.br/',
        'NOTE:O Robô LED que transforma sua festa em espetáculo! Atendimento em SP, ABC e Litoral.',
        'END:VCARD'
      ].join('\r\n');

      const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Robo_LED_Partner.vcf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Contato pronto para salvar! 📱');
    });
  }

  // 6. Analytics Click Tracker Hook
  const trackableLinks = document.querySelectorAll('[data-link]');
  trackableLinks.forEach(card => {
    card.addEventListener('click', () => {
      const linkName = card.getAttribute('data-link');
      console.log(`[Robô LED Links] Click tracked: ${linkName}`);
      
      // Google Analytics / GTM event (if configured)
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'bio_link_click', {
          link_name: linkName,
          target_url: card.getAttribute('href') || 'vcard_action'
        });
      }
      
      // Meta Pixel event (if configured)
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', 'BioLinkClick', {
          link_name: linkName
        });
      }
    });
  });

});
