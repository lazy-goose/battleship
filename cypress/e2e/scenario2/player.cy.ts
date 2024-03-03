it('Play with bot', () => {
    cy.visit('http://localhost:8181')

    cy.get('input[type=text]').type('some_user')
    cy.get('input[type=password]').type('a$$word')
    cy.get('button[type=submit]').click()

    cy.get('button').contains('Play with Bot').click()
    cy.get('button').contains('Automatically', { timeout: 15000 }).click()
})
