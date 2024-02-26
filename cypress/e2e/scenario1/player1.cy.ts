it('Game session 1 with player 1', () => {
    cy.visit('http://localhost:8181')

    cy.get('input[type=text]').type('some_user')
    cy.get('input[type=password]').type('a$$word')
    cy.get('button[type=submit]').click()

    cy.get('button').contains('Create Room').click()
})
