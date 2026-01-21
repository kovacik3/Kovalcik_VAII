// AJAX helpers for the app (no page reload)
// - Reservation delete (rezervacie)
// - User role update (uzivatelia)

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    initAjaxReservationDelete();
    initAjaxUserRoleUpdate();
  });

  function getCsrfTokenFromForm(form) {
    return form?.querySelector('input[name="_csrf"]')?.value || "";
  }

  function setButtonLoading(button, isLoading) {
    if (!button) return;
    if (isLoading) {
      button.disabled = true;
      button.dataset._oldHtml = button.innerHTML;
      button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    } else {
      button.disabled = false;
      if (button.dataset._oldHtml) {
        button.innerHTML = button.dataset._oldHtml;
        delete button.dataset._oldHtml;
      }
    }
  }

  // --------------------
  // 1) AJAX delete reservation
  // --------------------
  function initAjaxReservationDelete() {
    const forms = document.querySelectorAll("form.js-ajax-reservation-delete");
    if (!forms || forms.length === 0) return;

    forms.forEach((form) => {
      form.addEventListener("submit", async (event) => {
        // Keep a full fallback if fetch is missing
        if (!window.fetch) return;

        event.preventDefault();

        const reservationId = form.getAttribute("data-reservation-id");
        if (!reservationId) {
          // fallback to normal submit
          form.submit();
          return;
        }

        const csrfToken = getCsrfTokenFromForm(form);
        const submitButton = form.querySelector('button[type="submit"]');

        try {
          setButtonLoading(submitButton, true);

          const resp = await fetch(`/api/rezervacie/${encodeURIComponent(reservationId)}/delete`, {
            method: "POST",
            headers: {
              "X-CSRF-Token": csrfToken,
            },
          });

          if (!resp.ok) {
            let msg = "Chyba pri mazaní rezervácie.";
            try {
              const data = await resp.json();
              if (data?.error) msg = data.error;
            } catch (_) {
              // ignore
            }
            alert(msg);
            return;
          }

          const row = form.closest("tr");
          if (row) {
            row.style.opacity = "0.5";
            row.style.transition = "opacity 200ms ease";
            setTimeout(() => row.remove(), 200);
          } else {
            // fallback refresh
            window.location.reload();
          }
        } catch (err) {
          console.error("AJAX delete reservation failed:", err);
          alert("Chyba pri mazaní rezervácie.");
        } finally {
          setButtonLoading(submitButton, false);
        }
      });
    });
  }

  // --------------------
  // 2) AJAX update user role
  // --------------------
  function initAjaxUserRoleUpdate() {
    const forms = document.querySelectorAll("form.js-ajax-user-role");
    if (!forms || forms.length === 0) return;

    forms.forEach((form) => {
      form.addEventListener("submit", async (event) => {
        if (!window.fetch) return;

        event.preventDefault();

        const userId = form.getAttribute("data-user-id");
        const select = form.querySelector('select[name="role"]');
        const submitButton = form.querySelector('button[type="submit"]');

        if (!userId || !select) {
          form.submit();
          return;
        }

        const csrfToken = getCsrfTokenFromForm(form);
        const role = (select.value || "").toString();

        try {
          setButtonLoading(submitButton, true);

          const body = new URLSearchParams({ role });

          const resp = await fetch(`/api/uzivatelia/${encodeURIComponent(userId)}/role`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
              "X-CSRF-Token": csrfToken,
            },
            body,
          });

          const data = await resp.json().catch(() => null);

          if (!resp.ok || !data?.success) {
            const msg =
              (data?.errors && Array.isArray(data.errors) && data.errors.join("\n")) ||
              data?.error ||
              "Nepodarilo sa uložiť rolu.";
            alert(msg);
            return;
          }

          const row = form.closest("tr");
          const badge = row?.querySelector(".js-user-role-badge");
          if (badge) {
            badge.textContent = data.role;
            badge.className = "badge js-user-role-badge " + badgeClassForRole(data.role);
          }

          // small inline feedback
          showInlineSaved(form);
        } catch (err) {
          console.error("AJAX update role failed:", err);
          alert("Chyba pri ukladaní roly.");
        } finally {
          setButtonLoading(submitButton, false);
        }
      });
    });
  }

  function badgeClassForRole(role) {
    if (role === "admin") return "bg-danger";
    if (role === "trainer") return "bg-info text-dark";
    return "bg-secondary";
  }

  function showInlineSaved(form) {
    const existing = form.querySelector(".js-saved-hint");
    if (existing) existing.remove();

    const hint = document.createElement("div");
    hint.className = "form-text text-success js-saved-hint";
    hint.textContent = "Uložené.";
    form.appendChild(hint);

    setTimeout(() => {
      try {
        hint.remove();
      } catch (_) {
        // ignore
      }
    }, 1500);
  }
})();
