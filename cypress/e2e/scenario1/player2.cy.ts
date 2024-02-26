it('Player2', () => {
    cy.visit('http://localhost:8181')

    cy.get('input[type=text]').type('some_user_2')
    cy.get('input[type=password]').type('ana**s')
    cy.get('button[type=submit]').click()

    cy.get('button').contains('add to Room').last().click()
    cy.get('button').contains('Automatically').click()
})
