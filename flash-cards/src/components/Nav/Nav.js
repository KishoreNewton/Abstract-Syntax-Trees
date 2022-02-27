import { Button } from "../Button/Button.js";
export const Nav = ({ currentPage, setCurrentPage }) => (
  <nav className="nav__container">
    <h1 className="nav__logo">
      <button
        className="nav__logo-button"
        onClick={() =>
          setCurrentPage((currentPage) =>
            currentPage === "dashboard" ? "dashboard" : "landingPage"
          )
        }
      >
        <span role="img" className="nav__logo-img">
          ⚡
        </span>
        Flash
      </button>
    </h1>
    <ul className="nav__buttons">
      {currentPage === "dashboard" ? (
        <li>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setCurrentPage("logIn")}
          >
            <span role="img">🔓</span> Log out
          </Button>
        </li>
      ) : (
        <>
          <li>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCurrentPage("logIn")}
            >
              <span role="img">🔐</span> Log in
            </Button>
          </li>
          <li>
            <Button type="button" onClick={() => setCurrentPage("signUp")}>
              <span role="img">📝</span> Sign up
            </Button>
          </li>
        </>
      )}
    </ul>
  </nav>
);
